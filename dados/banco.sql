CREATE DATABASE IF NOT EXISTS libras_na_pratica
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE libras_na_pratica;

CREATE TABLE IF NOT EXISTS professores (
    id_professor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conteudos (
    id_conteudo INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(160) NOT NULL,
    descricao TEXT NOT NULL,
    nivel ENUM('iniciante', 'intermediario', 'avancado') NOT NULL,
    tipo ENUM('video', 'material', 'tarefa', 'texto') NOT NULL,
    url_recurso VARCHAR(500),
    texto_conteudo TEXT,
    publicado TINYINT(1) NOT NULL DEFAULT 1,
    id_professor INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conteudos_professores
        FOREIGN KEY (id_professor) REFERENCES professores(id_professor)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
