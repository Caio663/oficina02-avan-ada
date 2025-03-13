const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const validarAluno = (req, res, next) => {
    const { nome, email, dataNascimento } = req.body;
    if (!nome || !email || !dataNascimento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    next();
};

const validarBoletim = (req, res, next) => {
    const { alunoId, professorId, matematica, portugues, historia, ciencias, ingles, dataAvaliacao } = req.body;

    if (!alunoId || !professorId || !dataAvaliacao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    if (isNaN(alunoId) || isNaN(professorId)) {
        return res.status(400).json({ error: 'Os IDs de aluno e professor devem ser números válidos.' });
    }

    const notas = [matematica, portugues, historia, ciencias, ingles];
    for (let nota of notas) {
        if (nota !== undefined && isNaN(nota)) {
            return res.status(400).json({ error: `A nota ${nota} não é válida.` });
        }
    }
    next();
};

const validarProfessor = (req, res, next) => {
    const { nome, email, departamento } = req.body;
    if (!nome || !email || !departamento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    next();
};

const verificarExistenciaAlunoProfessor = async (alunoId, professorId, res) => {
    console.log(`Buscando aluno com ID: ${alunoId}`);
    const aluno = await prisma.aluno.findUnique({ where: { id: parseInt(alunoId) } });

    console.log(`Buscando professor com ID: ${professorId}`);
    const professor = await prisma.professor.findUnique({ where: { id: parseInt(professorId) } });

    if (!aluno) {
        console.error(`Aluno com ID ${alunoId} não encontrado.`);
        return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    if (!professor) {
        console.error(`Professor com ID ${professorId} não encontrado.`);
        return res.status(404).json({ error: 'Professor não encontrado.' });
    }

    return { aluno, professor };
};

app.get('/alunos', async (req, res) => {
    try {
        const alunos = await prisma.aluno.findMany();
        res.json(alunos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
});

app.post('/alunos', validarAluno, async (req, res) => {
    try {
        const { nome, email, dataNascimento } = req.body;
        const aluno = await prisma.aluno.create({
            data: { nome, email, dataNascimento: new Date(dataNascimento) },
        });
        res.status(201).json(aluno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar aluno.' });
    }
});

app.put('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, dataNascimento } = req.body;
    try {
        const aluno = await prisma.aluno.update({
            where: { id: parseInt(id) },
            data: { nome, email, dataNascimento: new Date(dataNascimento) },
        });
        res.status(200).json(aluno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar aluno.' });
    }
});

app.delete('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const boletins = await prisma.boletim.findMany({ where: { alunoId: parseInt(id) } });
        if (boletins.length > 0) {
            return res.status(400).json({ error: 'Não é possível remover um aluno com boletins vinculados.' });
        }
        await prisma.aluno.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Aluno removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover aluno.' });
    }
});

app.get('/professores', async (req, res) => {
    try {
        const professores = await prisma.professor.findMany();
        res.json(professores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar professores.' });
    }
});

app.post('/professores', validarProfessor, async (req, res) => {
    try {
        const { nome, email, departamento } = req.body;
        const professor = await prisma.professor.create({
            data: { nome, email, departamento },
        });
        res.status(201).json(professor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar professor.' });
    }
});

app.put('/professores/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, departamento } = req.body;
    try {
        const professor = await prisma.professor.update({
            where: { id: parseInt(id) },
            data: { nome, email, departamento },
        });
        res.status(200).json(professor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar professor.' });
    }
});

app.delete('/professores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const boletins = await prisma.boletim.findMany({ where: { professorId: parseInt(id) } });
        if (boletins.length > 0) {
            return res.status(400).json({ error: 'Não é possível remover um professor com boletins vinculados.' });
        }
        await prisma.professor.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Professor removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover professor.' });
    }
});

app.get('/boletins', async (req, res) => {
    try {
        const boletins = await prisma.boletim.findMany({
            include: { aluno: true, professor: true },
        });
        res.json(boletins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar boletins.' });
    }
});

app.post('/boletins', validarBoletim, async (req, res) => {
    const { alunoId, professorId, matematica, portugues, historia, ciencias, ingles, dataAvaliacao } = req.body;

    const registros = await verificarExistenciaAlunoProfessor(alunoId, professorId, res);
    if (!registros) return;

    const notas = [matematica, portugues, historia, ciencias, ingles];
    const media = notas.reduce((acc, nota) => acc + parseFloat(nota), 0) / notas.length;

    try {
        const boletim = await prisma.boletim.create({
            data: {
                aluno: { connect: { id: parseInt(alunoId) } },
                professor: { connect: { id: parseInt(professorId) } },
                matematica: parseFloat(matematica),
                portugues: parseFloat(portugues),
                historia: parseFloat(historia),
                ciencias: parseFloat(ciencias),
                ingles: parseFloat(ingles),
                media: media,
                dataAvaliacao: new Date(dataAvaliacao),
            },
            include: { aluno: true, professor: true }
        });
        res.status(201).json(boletim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao cadastrar boletim.' });
    }
});

app.put('/boletins/:id', async (req, res) => {
    const { id } = req.params;
    const { alunoId, professorId, matematica, portugues, historia, ciencias, ingles, dataAvaliacao } = req.body;

    const registros = await verificarExistenciaAlunoProfessor(alunoId, professorId, res);
    if (!registros) return;

    const notas = [matematica, portugues, historia, ciencias, ingles];
    const media = notas.reduce((acc, nota) => acc + parseFloat(nota), 0) / notas.length;

    try {
        const boletim = await prisma.boletim.update({
            where: { id: parseInt(id) },
            data: {
                aluno: { connect: { id: parseInt(alunoId) } },
                professor: { connect: { id: parseInt(professorId) } },
                matematica: parseFloat(matematica),
                portugues: parseFloat(portugues),
                historia: parseFloat(historia),
                ciencias: parseFloat(ciencias),
                ingles: parseFloat(ingles),
                media: media,
                dataAvaliacao: new Date(dataAvaliacao),
            },
            include: { aluno: true, professor: true }
        });
        res.status(200).json(boletim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao editar boletim.' });
    }
});

app.delete('/boletins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.boletim.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Boletim removido com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover boletim.' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
