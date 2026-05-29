package com.mrjohn.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_bairro_entrega")
public class BairroEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bairro_entrega_id")
    private Long id;

    private String bairro;

    @Column(name = "valor_entrega")
    private BigDecimal valorEntrega;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }
    public BigDecimal getValorEntrega() { return valorEntrega; }
    public void setValorEntrega(BigDecimal valorEntrega) { this.valorEntrega = valorEntrega; }
}