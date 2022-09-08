import React, { useEffect, useRef, useState } from "react";
import { Title, Form, Repos, Error } from "./styles";
import logo from "../../assets/logo.svg";
import { api } from "../../services/api";

import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

interface GithubRepository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export const Dashboard: React.FC = () => {
  const [repos, setRepos] = useState<GithubRepository[]>(() => {
    const storageRepos = localStorage.getItem("@GitCollection:repositories");

    if (storageRepos) {
      return JSON.parse(storageRepos);
    }

    return [];
  });
  const [newRepo, setNewRepo] = useState("");
  const [inputError, setInputError] = useState("");
  const formEl = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    localStorage.setItem("@GitCollection:repositories", JSON.stringify(repos));
  }, [repos]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setNewRepo(event.target.value);
  }

  async function handleAddRepo(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    if (!newRepo) {
      setInputError("Informe o username/repositorio");
      return;
    }

    try {
      const response = await api.get<GithubRepository>(`repos/${newRepo}`);
      const repository = response.data;

      setRepos([...repos, repository]);
      formEl.current?.reset();
      setNewRepo("");
      setInputError("");
    } catch {
      setInputError("Repositorio não encontrado no github");
    }
  }

  return (
    <>
      <img src={logo} alt="gitCollection" />
      <Title>Catálogo de repositórios do Github</Title>

      <Form
        ref={formEl}
        onSubmit={handleAddRepo}
        hasError={Boolean(inputError)}
      >
        <input
          placeholder="username/repository_name"
          onChange={handleInputChange}
        />
        <button type="submit">Buscar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repos>
        {repos.map((repository, index) => (
          <Link
            to={`/repositories/${repository.full_name}`}
            key={repository.full_name + index}
          >
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repos>
    </>
  );
};
