package com.mrjohn.service;

import com.mrjohn.dto.PedidoDTO;
import com.mrjohn.dto.StatusUpdateDTO;
import com.mrjohn.model.ItemPedido;
import com.mrjohn.model.Pedido;
import com.mrjohn.model.StatusPedido;
import com.mrjohn.repository.PedidoRepository;
import com.mrjohn.repository.ProdutoRepository;
import com.mrjohn.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    // Criar novo pedido
    public Pedido criarPedido(PedidoDTO dto) {
        Pedido pedido = new Pedido();

        pedido.setUsuario(usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado")));

        pedido.setStatus(StatusPedido.RECEBIDO);

        List<ItemPedido> listaItens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (var itemDto : dto.itens()) {
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado: " + itemDto.produtoId()));

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setPrecoUnitario(produto.getPreco());

            // Calcula total no backend
            total = total.add(produto.getPreco().multiply(BigDecimal.valueOf(itemDto.quantidade())));
            listaItens.add(item);
        }

        pedido.setItens(listaItens);
        pedido.setValorTotal(total);

        return pedidoRepository.save(pedido);
    }

    // Listar todos os pedidos
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    // Buscar pedido por ID
    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }

    // Listar por status
    public List<Pedido> listarPorStatus(StatusPedido status) {
        return pedidoRepository.findByStatus(status);
    }

    // Listar por usuario
    public List<Pedido> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId);
    }

    // Atualizar status
    public Pedido atualizarStatus(Long id, StatusUpdateDTO dto) {
        Pedido pedido = buscarPorId(id);
        pedido.setStatus(dto.novoStatus());
        return pedidoRepository.save(pedido);
    }
}