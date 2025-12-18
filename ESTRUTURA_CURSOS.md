# Estrutura de Cursos Implementada

## Hierarquia Completa:
```
Curso (nível superior)
  └── Módulo (dentro do curso)
       └── Aula (dentro do módulo)
```

## O que foi implementado:

### 1. Banco de Dados
- ✅ Tabela `courses` criada
- ✅ Campo `course_id` adicionado em `courses_modules`
- ✅ Políticas RLS configuradas

### 2. Painel Admin - Aba Cursos
- ✅ Criar novo curso (título, descrição, imagem)
- ✅ Editar curso existente
- ✅ Excluir curso (com confirmação)
- ✅ Visualizar resumo (módulos e aulas por curso)

### 3. Painel Admin - Aba Módulos
- ✅ Campo para selecionar curso ao criar módulo
- ✅ Editar módulo e alterar curso
- ✅ Visualizar qual curso o módulo pertence
- ✅ Lista de módulos com informações do curso

### 4. Painel Admin - Aba Aulas
- ✅ Criar aula vinculada ao módulo
- ✅ Módulos já estão vinculados aos cursos

## Como usar:

### Passo 1: Execute a migração SQL
Execute o arquivo `CREATE_COURSES_STRUCTURE.sql` no Supabase SQL Editor.

### Passo 2: Criar Curso
1. Acesse `/admin`
2. Vá na aba "Cursos"
3. Preencha título, descrição e imagem (opcional)
4. Clique em "Adicionar Curso"

### Passo 3: Criar Módulo
1. Vá na aba "Módulos"
2. Selecione o curso no dropdown
3. Preencha título e descrição
4. Clique em "Adicionar Módulo"

### Passo 4: Criar Aula
1. Vá na aba "Aulas"
2. Selecione um módulo (que já está vinculado a um curso)
3. Preencha os dados da aula
4. Clique em "Adicionar Aula"

## Estrutura de Dados:

```
courses
  - id
  - title
  - description
  - image_url
  - order

courses_modules
  - id
  - course_id (REFERÊNCIA AO CURSO)
  - title
  - description
  - order

courses_lessons
  - id
  - module_id (REFERÊNCIA AO MÓDULO)
  - title
  - video_vturb_url (código embed)
  - description_html
  - is_premium
  - order
```


