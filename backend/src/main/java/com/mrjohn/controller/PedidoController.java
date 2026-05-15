package com.mrjohn.controller;

import com.mrjohn.dto.PedidoDTO;
import com.mrjohn.dto.StatusUpdateDTO;
import com.mrjohn.model.Pedido;
import com.mrjohn.model.StatusPedido;
import com.mrjohn.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> criarPedido(@Valid @RequestBody PedidoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.criarPedido(dto));
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> listarTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPorId(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Pedido>> listarPorStatus(@PathVariable StatusPedido status) {
        return ResponseEntity.ok(pedidoService.listarPorStatus(status));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedido>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Pedido> atualizarStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(pedidoService.atualizarStatus(id, dto));
    }
}