package com.mrjohn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mrjohn.model.Usuario;

/**
 * Camada de persistência para a tabela de usuários.
 * O JpaRepository já traz pronto: salvar, deletar, buscar por ID, etc.
 * @author Douglas Ribeiro
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    

}