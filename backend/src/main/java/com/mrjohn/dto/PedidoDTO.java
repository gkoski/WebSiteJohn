package com.mrjohn.dto;

import java.math.BigDecimal;
import java.util.List;

public record PedidoDTO(
        Long usuarioId,
        List<ItemCarrinhoDTO> itens,
        BigDecimal valorTotal
) {}