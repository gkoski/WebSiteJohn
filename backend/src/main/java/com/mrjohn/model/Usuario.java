package com.mrjohn.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


/**
 * Entidade Usuario configurada para Spring Boot.
 * Representa a tabela 'usuarios' no banco de dados do Mr. John SportBar.
 * 
 * @author Douglas Ribeiro
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 3, max = 100)
    private String nome;
    
    @Column(unique = true) 
    private String cpf;

    @Email
    @NotNull
    private String email;

    @Email
    @NotNull
    private String login;

    @NotNull
    @Size(min = 6)
    private String senha; 
 
    public Usuario() {}


    public Usuario(String nome, String cpf, String email, String login, String senha) {
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.login = email;
        this.senha = senha;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    
    public String getEmail() { return email; }
    
    public void setEmail(String email) { 
        this.email = email; 
        this.login = email;
    }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    // equals e hashCode baseados no ID
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Usuario)) return false;
        Usuario usuario = (Usuario) o;
        return id != null && id.equals(usuario.id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // toString sem expor a senha
    @Override
    public String toString() {
        return "Usuario{id=" + id + 
               ", nome='" + nome + '\'' +
               ", email='" + email + '\'' +
               ", login='" + login + '\'' +
               '}';
    }
}
