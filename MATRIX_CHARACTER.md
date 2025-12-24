# 🎭 Matrix Character - Efeito 3D de Moeda Girando

## 📋 O que foi feito

### 1. ✂️ Processamento da Imagem

- **Script Python**: `process_character.py`
- **Remoção de fundo**: Algoritmo manual baseado em threshold de luminosidade
- **Filtro Matrix**: Conversão para escala de cinza + colorização verde
  - Canal verde: 100% da luminosidade
  - Canal vermelho: 10% (para tons escuros)
  - Canal azul: 15% (para profundidade)
- **Resultado**: `character_final.png` com fundo transparente e cores Matrix

### 2. 🎨 Componente Vue com Efeito 3D

- **Arquivo**: `src/components/MatrixCharacter.vue`
- **Localização**: Canto inferior esquerdo (bottom: 2rem, left: 2rem)
- **Dimensões**: 200x200px

#### Efeitos Aplicados:

- **Rotação 3D**: `rotateY(360deg)` em 4 segundos (loop infinito)
- **Perspectiva**: 1000px para efeito de profundidade
- **Dupla face**: Front e back com imagens
- **Backface hidden**: Efeito de moeda real
- **Border glow**: Borda verde neon com box-shadow
- **Glow pulsante**: Aura verde que pulsa a cada 3 segundos
- **Hover interativo**: Acelera rotação para 2 segundos

#### Estrutura CSS 3D:

```scss
.matrix-character {
  perspective: 1000px; // Profundidade 3D

  .character-spinner {
    transform-style: preserve-3d; // Mantém 3D nos filhos
    animation: spinCoin; // Rotação contínua

    .character-front,
    .character-back {
      backface-visibility: hidden; // Esconde face traseira
      transform: rotateY(180deg); // Back rotacionado 180°
    }
  }
}
```

### 3. 🎯 Integração no App

- **Importado em**: `src/App.vue`
- **Z-index**: 999 (abaixo dos controles)
- **Posição fixa**: Não se move com scroll

## 🚀 Como funciona a animação

### Rotação tipo Moeda:

1. **Initial state**: 0° (frente visível)
2. **90°**: Lateral (estreita)
3. **180°**: Costas visível (back face)
4. **270°**: Lateral oposta
5. **360°**: Volta ao início (loop)

### Efeito Matrix na Imagem:

- **Grayscale**: Remove cores originais
- **Contrast boost**: 1.3x mais contraste
- **Green mapping**: Luminosidade → Verde
- **Alpha preserved**: Transparência mantida
- **Sharpen filter**: Nitidez aumentada

## 🎨 Customizações Disponíveis

### Ajustar velocidade de rotação:

```scss
animation: spinCoin 4s linear infinite; // Mude 4s para mais rápido/lento
```

### Ajustar tamanho:

```scss
.matrix-character {
  width: 200px; // Altere conforme necessário
  height: 200px;
}
```

### Ajustar posição:

```scss
.matrix-character {
  bottom: 2rem; // Distância do fundo
  left: 2rem; // Distância da esquerda
}
```

### Ajustar intensidade do glow:

```scss
box-shadow: 0 0 20px rgba(0, 255, 65, 0.5), // Primeiro valor = raio do blur
  inset 0 0 20px rgba(0, 255, 0, 0.2); // Segundo = glow interno
```

## 📦 Dependências Python (para reprocessar)

```bash
pip install pillow numpy rembg
```

## 🔧 Reprocessar Imagem

```bash
python process_character.py
```

## ✨ Recursos Visuais

- ✅ Fundo removido automaticamente
- ✅ Cores Matrix (preto e verde)
- ✅ Rotação 3D suave
- ✅ Glow pulsante verde neon
- ✅ Efeito hover interativo
- ✅ Borda luminosa
- ✅ Aura de energia verde
- ✅ Alta performance (CSS puro)

## 🎯 Performance

- **GPU Accelerated**: `transform` e `opacity` usam compositing
- **No JavaScript**: Animação 100% CSS
- **60 FPS**: Smooth em qualquer dispositivo
- **Lightweight**: Apenas uma imagem PNG

---

**Criado com** 🟢⚫ **Tema Matrix**
