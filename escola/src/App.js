import { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [boletins, setBoletins] = useState([]);
  const [novoAluno, setNovoAluno] = useState({ nome: "", email: "", dataNascimento: "" });
  const [novoBoletim, setNovoBoletim] = useState({ alunoId: "", professorId: "", matematica: "", portugues: "", historia: "", ciencias: "", ingles: "", media: "", dataAvaliacao: "" });
  const [novoProfessor, setNovoProfessor] = useState({ nome: "", email: "", departamento: "" });
  const [alunoEdit, setAlunoEdit] = useState(null);
  const [professorEdit, setProfessorEdit] = useState(null);
  const [boletimEdit, setBoletimEdit] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/alunos").then((res) => setAlunos(res.data));
    axios.get("http://localhost:3000/professores").then((res) => setProfessores(res.data));
    axios.get("http://localhost:3000/boletins").then((res) => setBoletins(res.data));
  }, []);

  const handleChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prevState => {
      const newState = { ...prevState, [name]: value };
      if (["matematica", "portugues", "historia", "ciencias", "ingles"].includes(name)) {
        newState.media = calculateAverage(newState);
      }
      return newState;
    });
  };

  const calculateAverage = (boletim) => {
    const { matematica, portugues, historia, ciencias, ingles } = boletim;
    const notas = [matematica, portugues, historia, ciencias, ingles].map(Number);
    const validNotas = notas.filter(nota => !isNaN(nota));
    const soma = validNotas.reduce((acc, nota) => acc + nota, 0);
    return validNotas.length ? (soma / validNotas.length).toFixed(2) : "";
  };

  const handleSubmitAluno = () => {
    if (alunoEdit) {
      axios.put(`http://localhost:3000/alunos/${alunoEdit.id}`, novoAluno)
        .then(res => {
          setAlunos(alunos.map(aluno => aluno.id === alunoEdit.id ? res.data : aluno));
          setAlunoEdit(null);
          setNovoAluno({ nome: "", email: "", dataNascimento: "" });
        })
        .catch(err => console.error("Erro ao atualizar aluno:", err));
    } else {
      axios.post("http://localhost:3000/alunos", novoAluno)
        .then(res => setAlunos(prevAlunos => [...prevAlunos, res.data]))
        .catch(err => console.error("Erro ao adicionar aluno:", err));
    }
  };

  const handleSubmitProfessor = () => {
    if (professorEdit) {
      axios.put(`http://localhost:3000/professores/${professorEdit.id}`, novoProfessor)
        .then(res => {
          setProfessores(professores.map(professor => professor.id === professorEdit.id ? res.data : professor));
          setProfessorEdit(null);
          setNovoProfessor({ nome: "", email: "", departamento: "" });
        })
        .catch(err => console.error("Erro ao atualizar professor:", err));
    } else {
      axios.post("http://localhost:3000/professores", novoProfessor)
        .then(res => setProfessores(prevProfessores => [...prevProfessores, res.data]))
        .catch(err => console.error("Erro ao adicionar professor:", err));
    }
  };

  const handleSubmitBoletim = () => {
    if (!novoBoletim.alunoId || !novoBoletim.professorId) {
      alert("Por favor, selecione aluno e professor.");
      return;
    }

    if (boletimEdit) {
      axios.put(`http://localhost:3000/boletins/${boletimEdit.id}`, novoBoletim)
        .then(res => {
          setBoletins(boletins.map(boletim => boletim.id === boletimEdit.id ? res.data : boletim));
          setBoletimEdit(null);
          setNovoBoletim({ alunoId: "", professorId: "", matematica: "", portugues: "", historia: "", ciencias: "", ingles: "", media: "", dataAvaliacao: "" }); // Limpar os campos após a atualização
        })
        .catch(err => console.error("Erro ao atualizar boletim:", err));
    } else {
      axios.post("http://localhost:3000/boletins", novoBoletim)
        .then(res => setBoletins(prevBoletins => [...prevBoletins, res.data]))
        .catch(err => console.error("Erro ao adicionar boletim:", err));
    }
  };

  const handleDeleteAluno = (id) => {
    axios.delete(`http://localhost:3000/alunos/${id}`)
      .then(() => setAlunos(alunos.filter(aluno => aluno.id !== id)))
      .catch(err => console.error("Erro ao remover aluno:", err));
  };

  const handleDeleteProfessor = (id) => {
    axios.delete(`http://localhost:3000/professores/${id}`)
      .then(() => setProfessores(professores.filter(professor => professor.id !== id)))
      .catch(err => console.error("Erro ao remover professor:", err));
  };

  const handleDeleteBoletim = (id) => {
    axios.delete(`http://localhost:3000/boletins/${id}`)
      .then(() => setBoletins(boletins.filter(boletim => boletim.id !== id)))
      .catch(err => console.error("Erro ao remover boletim:", err));
  };

  const handleEditAluno = (aluno) => {
    setAlunoEdit(aluno);
    setNovoAluno({ nome: aluno.nome, email: aluno.email, dataNascimento: aluno.dataNascimento });
  };

  const handleEditProfessor = (professor) => {
    setProfessorEdit(professor);
    setNovoProfessor({ nome: professor.nome, email: professor.email, departamento: professor.departamento });
  };

  const handleEditBoletim = (boletim) => {
    setBoletimEdit(boletim);
    setNovoBoletim({
      alunoId: boletim.alunoId,
      professorId: boletim.professorId,
      matematica: boletim.matematica,
      portugues: boletim.portugues,
      historia: boletim.historia,
      ciencias: boletim.ciencias,
      ingles: boletim.ingles,
      dataAvaliacao: boletim.dataAvaliacao,
      media: boletim.media,
    });
  };

  return (
    <div className="container">
      <h1>ALUNOS</h1>
      <ul>
        {alunos.map(aluno => (
          <li key={aluno.id}>
            {aluno.nome} - {aluno.email} - {new Date(aluno.dataNascimento).toLocaleDateString()}
            <button onClick={() => handleDeleteAluno(aluno.id)}>Remover</button>
            <button onClick={() => handleEditAluno(aluno)}>Editar</button>
          </li>
        ))}
      </ul>

      <h2>{alunoEdit ? "Editar Aluno" : "Adicionar Aluno"}</h2>
      <input type="text" name="nome" value={novoAluno.nome} onChange={(e) => handleChange(e, setNovoAluno)} placeholder="Nome" />
      <input type="email" name="email" value={novoAluno.email} onChange={(e) => handleChange(e, setNovoAluno)} placeholder="Email" />
      <input type="date" name="dataNascimento" value={novoAluno.dataNascimento} onChange={(e) => handleChange(e, setNovoAluno)} placeholder="Data de Nascimento" />
      <button onClick={handleSubmitAluno}>{alunoEdit ? "Atualizar Aluno" : "Adicionar Aluno"}</button>
      <hr></hr>
      <br></br>
      <h1>PROFESSORES</h1>
      <ul>
        {professores.map(professor => (
          <li key={professor.id}>
            {professor.nome} - {professor.email} - {professor.departamento}
            <button onClick={() => handleDeleteProfessor(professor.id)}>Remover</button>
            <button onClick={() => handleEditProfessor(professor)}>Editar</button>
          </li>
        ))}
      </ul>

      <h2>{professorEdit ? "Editar Professor" : "Adicionar Professor"}</h2>
      <input type="text" name="nome" value={novoProfessor.nome} onChange={(e) => handleChange(e, setNovoProfessor)} placeholder="Nome" />
      <input type="email" name="email" value={novoProfessor.email} onChange={(e) => handleChange(e, setNovoProfessor)} placeholder="Email" />
      <input type="text" name="departamento" value={novoProfessor.departamento} onChange={(e) => handleChange(e, setNovoProfessor)} placeholder="Departamento" />
      <button onClick={handleSubmitProfessor}>{professorEdit ? "Atualizar Professor" : "Adicionar Professor"}</button>
      <hr></hr>
      <br></br>
      <h1>BOLETINS</h1>
      <ul>
        {boletins.map(boletim => (
          <li key={boletim.id}>
            {boletim.aluno?.nome || "Aluno não encontrado"} - {boletim.professor?.nome || "Professor não encontrado"} - Matemática: {boletim.matematica} - Português: {boletim.portugues} - História: {boletim.historia} - Ciências: {boletim.ciencias} - Inglês: {boletim.ingles} - Média: {boletim.media.toFixed(2)}
            <button onClick={() => handleDeleteBoletim(boletim.id)}>Remover</button>
            <button onClick={() => handleEditBoletim(boletim)}>Editar</button>
          </li>
        ))}
      </ul>

      <h2>{boletimEdit ? "Editar Boletim" : "Adicionar Boletim"}</h2>
      <select name="alunoId" value={novoBoletim.alunoId} onChange={(e) => handleChange(e, setNovoBoletim)}>
        <option value="">Selecione o Aluno</option>
        {alunos.map(aluno => (
          <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
        ))}
      </select>

      <select name="professorId" value={novoBoletim.professorId} onChange={(e) => handleChange(e, setNovoBoletim)}>
        <option value="">Selecione o Professor</option>
        {professores.map(professor => (
          <option key={professor.id} value={professor.id}>{professor.nome}</option>
        ))}
      </select>

      <input type="number" name="matematica" value={novoBoletim.matematica} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="Matemática" />
      <input type="number" name="portugues" value={novoBoletim.portugues} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="Português" />
      <input type="number" name="historia" value={novoBoletim.historia} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="História" />
      <input type="number" name="ciencias" value={novoBoletim.ciencias} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="Ciências" />
      <input type="number" name="ingles" value={novoBoletim.ingles} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="Inglês" />
      <input type="date" name="dataAvaliacao" value={novoBoletim.dataAvaliacao} onChange={(e) => handleChange(e, setNovoBoletim)} placeholder="Data de Avaliação" />
      <button onClick={handleSubmitBoletim}>{boletimEdit ? "Atualizar Boletim" : "Adicionar Boletim"}</button>


      <footer>
        <p>Github - Caio663</p>
      </footer>
    </div>
  );
}

export default App;

