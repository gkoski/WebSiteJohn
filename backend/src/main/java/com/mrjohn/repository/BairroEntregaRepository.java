package com.mrjohn.repository;

import com.mrjohn.model.BairroEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BairroEntregaRepository extends JpaRepository<BairroEntrega, Long> {
    Optional<BairroEntrega> findByBairroIgnoreCase(String bairro);
}