package com.mrjohn.controller;

import com.mrjohn.dto.PedidoDTO;
import com.mrjohn.model.ItemPedido;
import com.mrjohn.model.Pedido;
import com.mrjohn.repository.ItemPedidoRepository;
import com.mrjohn.repository.PedidoRepository;
import com.mrjohn.repository.ProdutoRepository;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin("*")
public class PedidoController {

    @Autowired private PedidoRepository pedidoRepo;
    @Autowired private ItemPedidoRepository itemRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private ProdutoRepository produtoRepo;

    @PostMapping
    public ResponseEntity<Pedido> finalizarPedido(@RequestBody PedidoDTO dto) {
        Pedido pedido = new Pedido();

        pedido.setUsuario(usuarioRepo.findById(dto.usuarioId()).orElse(null));

        pedido.setValorTotal(dto.valorTotal());

        final Pedido pedidoSalvo = pedidoRepo.save(pedido);

        List<ItemPedido> listaItens = new ArrayList<>();

        dto.itens().forEach(itemDto -> {
            ItemPedido item = new ItemPedido();
            item.setPedido(pedidoSalvo);

            var produto = produtoRepo.findById(itemDto.produtoId()).orElse(null);

            if (produto != null) {
                item.setProduto(produto);
                item.setQuantidade(itemDto.quantidade());

                item.setPrecoUnitario(produto.getPreco());

                listaItens.add(item);
            }
        });

        itemRepo.saveAll(listaItens);

        return ResponseEntity.ok(pedidoSalvo);
    }
}