# Oficina 02 - Módulo Avançado.
# Código do Postgres, abaixo:
CREATE TABLE "Aluno" (
    "id" SERIAL PRIMARY KEY,            -- ID do aluno (auto-incremento)
    "nome" VARCHAR(255) NOT NULL,       -- Nome do aluno
    "email" VARCHAR(255) UNIQUE NOT NULL, -- E-mail do aluno (único)
    "dataNascimento" DATE NOT NULL      -- Data de nascimento do aluno
);

-- Criar tabela Professor
CREATE TABLE "Professor" (
    "id" SERIAL PRIMARY KEY,            -- ID do professor (auto-incremento)
    "nome" VARCHAR(255) NOT NULL,       -- Nome do professor
    "email" VARCHAR(255) UNIQUE NOT NULL, -- E-mail do professor (único)
    "departamento" VARCHAR(255) NOT NULL -- Departamento do professor
);

-- Criar tabela Boletim
CREATE TABLE "Boletim" (
    "id" SERIAL PRIMARY KEY,              -- ID do boletim (auto-incremento)
    "alunoId" INT NOT NULL,               -- ID do aluno (chave estrangeira)
    "professorId" INT NOT NULL,           -- ID do professor (chave estrangeira)
    "matematica" FLOAT NOT NULL,          -- Nota de Matemática
    "portugues" FLOAT NOT NULL,           -- Nota de Português
    "historia" FLOAT NOT NULL,            -- Nota de História
    "ciencias" FLOAT NOT NULL,            -- Nota de Ciências
    "ingles" FLOAT NOT NULL,              -- Nota de Inglês
    "media" FLOAT NOT NULL,               -- Média das notas
    "dataAvaliacao" DATE NOT NULL,        -- Data da avaliação
    CONSTRAINT "fk_aluno" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id"),  -- Relacionamento com a tabela Aluno
    CONSTRAINT "fk_professor" FOREIGN KEY ("professorId") REFERENCES "Professor"("id")  -- Relacionamento com a tabela Professor
);
