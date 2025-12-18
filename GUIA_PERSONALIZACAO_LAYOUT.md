# 🎨 Guia de Personalização do Layout da Área de Membros

## 📁 Arquivos Principais para Editar

### 1. **Layout Principal** 
📄 `src/pages/Members.tsx` (linhas 160-378)

Este é o arquivo principal que controla toda a estrutura da área de membros.

#### O que você pode alterar aqui:

- **Header** (linhas ~200-295): 
  - Menu hambúrguer com ferramentas IA
  - Logo e título
  - Botões de notificação e perfil
  
- **Banner Promocional** (linhas ~297-324):
  - Posição e estilo do banner
  - Comportamento ao clicar

- **Seções de Conteúdo** (linhas ~326-372):
  - Ordem das seções
  - Títulos das seções
  - Quais dados são exibidos
  - Adicionar/remover seções

---

### 2. **Card dos Módulos**
📄 `src/components/members/ModuleCardImage.tsx`

Aparência visual dos cards dos módulos.

**O que você pode alterar:**
- Tamanho do card (linha 26): `w-[300px] h-[200px]`
- Estilo do título (linha 59)
- Overlay/opacidade (linha 40)
- Indicador de progresso (linhas 44-48)
- Cores e gradientes

**Exemplo de alteração rápida:**
```tsx
// Para cards maiores:
'relative flex-shrink-0 w-[400px] h-[250px]' // ao invés de w-[300px] h-[200px]

// Para overlay mais claro:
'absolute inset-0 bg-black/20' // ao invés de bg-black/40
```

---

### 3. **Card de "Continue Assistindo"**
📄 `src/components/members/LessonContinueCard.tsx`

Aparência dos cards de aulas em progresso.

**O que você pode alterar:**
- Tamanho (linha 25): `w-[280px] h-[200px]`
- Informações exibidas (linhas 49-52)
- Botão de continuar (linhas 54-64)

---

### 4. **Seções com Scroll Horizontal**
📄 `src/components/members/HorizontalScrollSection.tsx`

Componente que cria as seções com scroll horizontal.

**O que você pode alterar:**
- Estilo do título (linha 31)
- Botões de navegação (linhas 33-50)
- Espaçamento entre cards (linha 56): `gap-4`

---

## 🛠️ Exemplos de Alterações Comuns

### 1. **Mudar o Título de uma Seção**

No arquivo `src/pages/Members.tsx`, linha ~329:

```tsx
<HorizontalScrollSection title="Método Sociedade">
```
Altere para:
```tsx
<HorizontalScrollSection title="Meus Cursos">
```

---

### 2. **Adicionar uma Nova Seção**

No arquivo `src/pages/Members.tsx`, após a linha ~364, adicione:

```tsx
{/* Sua Nova Seção */}
<HorizontalScrollSection title="Nova Seção">
  {/* Seu conteúdo aqui */}
  <div className="flex-shrink-0 w-[280px] h-[180px] rounded-xl bg-card border border-border flex items-center justify-center">
    <p className="text-muted-foreground">Conteúdo personalizado</p>
  </div>
</HorizontalScrollSection>
```

---

### 3. **Alterar o Layout de Cards para Grade**

Substitua o `HorizontalScrollSection` por uma grade:

```tsx
{/* Em vez de scroll horizontal, usar grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {modules.map((module) => (
    <ModuleCardImage
      key={module.id}
      title={module.title.toUpperCase()}
      imageUrl={module.image_url}
      progress={getModuleProgress(module.id)}
      onClick={() => navigate(`/members/module/${module.id}`)}
    />
  ))}
</div>
```

---

### 4. **Alterar Cores e Estilos**

Os estilos usam **Tailwind CSS**. Exemplos:

- **Cores**: `bg-primary`, `text-white`, `border-border`
- **Espaçamentos**: `p-4`, `gap-4`, `mb-6`
- **Tamanhos**: `w-[300px]`, `h-[200px]`, `text-xl`
- **Efeitos**: `hover:scale-[1.02]`, `transition-all`, `rounded-xl`

Você pode alterar qualquer classe Tailwind nos componentes.

---

### 5. **Reorganizar a Ordem dos Elementos**

No arquivo `src/pages/Members.tsx`, dentro do `<main>` (linha ~326), você pode:

- **Mover seções** copiando e colando os blocos
- **Ocultar seções** comentando com `{/* */}`
- **Adicionar espaçadores** com `<div className="h-8" />`

---

## 🎯 Onde Fazer Cada Tipo de Alteração

| O que você quer alterar | Arquivo para editar |
|------------------------|---------------------|
| Estrutura geral (header, banner, seções) | `src/pages/Members.tsx` |
| Aparência dos cards de módulos | `src/components/members/ModuleCardImage.tsx` |
| Aparência dos cards de aulas | `src/components/members/LessonContinueCard.tsx` |
| Estilo das seções (títulos, scroll) | `src/components/members/HorizontalScrollSection.tsx` |
| Cores globais do tema | `src/index.css` |
| Componentes reutilizáveis (botões, inputs) | `src/components/ui/` |

---

## 💡 Dicas

1. **Use o DevTools do navegador** (F12) para inspecionar elementos e ver classes CSS
2. **Tailwind CSS**: Todas as classes são utilitárias, você pode combiná-las livremente
3. **Hot Reload**: Mudanças são aplicadas automaticamente ao salvar (se o dev server estiver rodando)
4. **Teste em diferentes telas**: Use o modo responsivo do navegador (F12 → Toggle device toolbar)

---

## 🚀 Próximos Passos

1. Abra `src/pages/Members.tsx` no seu editor
2. Localize a seção que deseja alterar
3. Modifique as classes CSS ou estrutura HTML
4. Salve e veja as mudanças no navegador

Qualquer dúvida sobre classes Tailwind: https://tailwindcss.com/docs


