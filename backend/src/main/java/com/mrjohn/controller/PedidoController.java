package com.mrjohn.controller;

import com.mrjohn.dto.PedidoDTO;
import com.mrjohn.model.ItemPedido;
import com.mrjohn.model.Pedido;
import com.mrjohn.repository.PedidoRepository;
import com.mrjohn.repository.ProdutoRepository;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin("*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @Autowired
    private ProdutoRepository produtoRepo;


    @PostMapping
    public ResponseEntity<Pedido> finalizarPedido(@RequestBody PedidoDTO dto) {
        try {
            Pedido pedido = new Pedido();
            pedido.setUsuario(usuarioRepo.findById(dto.usuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado")));

            pedido.setValorTotal(dto.valorTotal());
            pedido.setStatus("RECEBIDO");

            List<ItemPedido> listaItens = new ArrayList<>();

            dto.itens().forEach(itemDto -> {
                var produto = produtoRepo.findById(itemDto.produtoId())
                        .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));

                ItemPedido item = new ItemPedido();
                item.setPedido(pedido);
                item.setProduto(produto);
                item.setQuantidade(itemDto.quantidade());
                item.setPrecoUnitario(produto.getPreco());

                listaItens.add(item);
            });

            pedido.setItens(listaItens);

            Pedido pedidoFinalizado = pedidoRepo.save(pedido);

            return ResponseEntity.status(HttpStatus.CREATED).body(pedidoFinalizado);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}