package com.mrjohn.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.mrjohn.model.Produto;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    // Métodos padrão já inclusos
}