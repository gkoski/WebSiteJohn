package com.mrjohn.dto;

import com.mrjohn.model.StatusPedido;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateDTO(
        @NotNull StatusPedido novoStatus
) {}