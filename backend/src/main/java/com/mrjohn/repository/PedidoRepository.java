package com.mrjohn.repository;

import com.mrjohn.model.Pedido;
import com.mrjohn.model.StatusPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByStatus(StatusPedido status);

    List<Pedido> findByUsuarioId(Long usuarioId);

    @Query("SELECT p FROM Pedido p JOIN FETCH p.itens JOIN FETCH p.usuario")
    List<Pedido> findAllWithItens();
}