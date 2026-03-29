/**
 * OpenAPI 3.0 Specification for Buro 710 External API
 */

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Buro 710 External API',
    version: '1.0.0',
    description: 'API для отримання публічного контенту студії архітектури Buro 710',
    contact: { name: 'Buro 710', email: 'info@buro710.com' },
  },
  servers: [
    { url: '/api/v1', description: 'Поточний сервер' },
    { url: 'https://api-staging.b710.design/api/v1', description: 'Staging сервер' },
    { url: 'http://localhost:3000/api/v1', description: 'Development сервер' },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'API ключ для авторизації' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' }, message: { type: 'string' } },
        required: ['error'],
      },
      ValidationError: {
        type: 'object',
        properties: { errors: { type: 'array', items: { type: 'string' } } },
        required: ['errors'],
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published'] },
          hero_image_url: { type: 'string', nullable: true },
          hero_title: { type: 'string', nullable: true },
          hero_subtitle: { type: 'string', nullable: true },
          hero_tags: { type: 'array', items: { type: 'string' } },
          hero_location: { type: 'string', nullable: true },
          hero_year: { type: 'string', nullable: true },
          seo_title: { type: 'string', nullable: true },
          seo_description: { type: 'string', nullable: true },
          og_image_url: { type: 'string', nullable: true },
          gallery_images: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'slug', 'status', 'created_at', 'updated_at'],
      },
      Block: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          post_id: { type: 'string' },
          type: { type: 'string', enum: ['text_full', 'image_full', 'text_image', 'image_text', 'three_images'] },
          data: { type: 'object' },
          sort_order: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'post_id', 'type', 'data', 'sort_order'],
      },
      PostWithBlocks: {
        type: 'object',
        properties: { post: { $ref: '#/components/schemas/Post' }, blocks: { type: 'array', items: { $ref: '#/components/schemas/Block' } } },
        required: ['post', 'blocks'],
      },
      Pagination: {
        type: 'object',
        properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
      PostListResponse: {
        type: 'object',
        properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Post' } }, pagination: { $ref: '#/components/schemas/Pagination' } },
        required: ['data', 'pagination'],
      },
      DeleteResponse: {
        type: 'object',
        properties: { message: { type: 'string' } },
        required: ['message'],
      },
    },
  },
  paths: {
    '/posts': {
      get: {
        summary: 'Отримати список постів',
        description: 'Повертає список постів з пагінацією та фільтрацією',
        tags: ['Posts'],
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Номер сторінки' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Елементів на сторінці' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published'] }, description: 'Фільтр за статусом' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Пошук за заголовком/slug' },
        ],
        responses: {
          '200': { description: 'Список постів', content: { 'application/json': { schema: { $ref: '#/components/schemas/PostListResponse' } } } },
          '401': { description: 'Неавторизовано', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Помилка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      post: {
        summary: 'Створити новий пост',
        description: 'Створює пост (JSON або multipart/form-data для файлів)',
        tags: ['Posts'],
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Заголовок (обов\'язкове)' },
                  slug: { type: 'string', description: 'URL-slug (авто-генерація)' },
                  status: { type: 'string', enum: ['draft', 'published'] },
                  hero_image_url: {
                    type: 'string',
                    description: 'URL hero зображення (альтернатива hero_image файлу). Якщо передано файл, файл має пріоритет.',
                    example: 'https://example.com/hero-image.jpg',
                  },
                  og_image_url: {
                    type: 'string',
                    description: 'URL OG зображення для соціальних мереж (альтернатива og_image файлу). Якщо передано файл, файл має пріоритет.',
                    example: 'https://example.com/og-image.jpg',
                  },
                  hero_title: { type: 'string' }, hero_subtitle: { type: 'string' },
                  hero_tags: { type: 'string', description: 'JSON-масив тегів' },
                  hero_location: { type: 'string' }, hero_year: { type: 'string' },
                  seo_title: { type: 'string' }, seo_description: { type: 'string' },
                  gallery_images: { type: 'string', description: 'JSON-масив URL' },
                  blocks: { type: 'string', description: 'JSON-масив блоків' },
                },
                required: ['title'],
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' }, slug: { type: 'string' }, status: { type: 'string', enum: ['draft', 'published'] },
                  hero_image: { type: 'string', format: 'binary', description: 'Головне зображення (JPEG/PNG, макс 5MB). Має пріоритет над hero_image_url.' },
                  og_image: { type: 'string', format: 'binary', description: 'OG зображення для соціальних мереж (JPEG/PNG, макс 5MB). Має пріоритет над og_image_url.' },
                  hero_image_url: { type: 'string', description: 'URL hero зображення (використовується, якщо не передано файл)' },
                  og_image_url: { type: 'string', description: 'URL OG зображення (використовується, якщо не передано файл)' },
                  hero_title: { type: 'string' }, hero_subtitle: { type: 'string' },
                  hero_tags: { type: 'string', description: 'JSON-масив тегів' },
                  hero_location: { type: 'string' }, hero_year: { type: 'string' },
                  seo_title: { type: 'string' }, seo_description: { type: 'string' },
                  gallery_images: { type: 'string', description: 'JSON-масив існуючих URL' },
                  blocks: { type: 'string', description: 'JSON-масив блоків' },
                },
                required: ['title'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Пост створено', content: { 'application/json': { schema: { $ref: '#/components/schemas/PostWithBlocks' } } } },
          '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/Error' }, { $ref: '#/components/schemas/ValidationError' }] } } } },
          '401': { description: 'Неавторизовано', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Помилка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/posts/{id}': {
      get: {
        summary: 'Отримати пост за ID',
        description: 'Повертає пост з усіма блоками контенту',
        tags: ['Posts'],
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID поста' }],
        responses: {
          '200': { description: 'Деталі поста', content: { 'application/json': { schema: { $ref: '#/components/schemas/PostWithBlocks' } } } },
          '401': { description: 'Неавторизовано', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Пост не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Помилка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        summary: 'Оновити пост',
        description: 'Оновлює пост (JSON або multipart/form-data)',
        tags: ['Posts'],
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID поста' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' }, slug: { type: 'string' }, status: { type: 'string', enum: ['draft', 'published'] },
                  hero_image_url: {
                    type: 'string',
                    description: 'URL hero зображення (альтернатива hero_image файлу). Якщо передано файл, файл має пріоритет.',
                    example: 'https://example.com/hero-image.jpg',
                  },
                  og_image_url: {
                    type: 'string',
                    description: 'URL OG зображення для соціальних мереж (альтернатива og_image файлу). Якщо передано файл, файл має пріоритет.',
                    example: 'https://example.com/og-image.jpg',
                  },
                  hero_title: { type: 'string' }, hero_subtitle: { type: 'string' },
                  hero_tags: { type: 'string', description: 'JSON-масив тегів' },
                  hero_location: { type: 'string' }, hero_year: { type: 'string' },
                  seo_title: { type: 'string' }, seo_description: { type: 'string' },
                  gallery_images: { type: 'string', description: 'JSON-масив URL' },
                  blocks: { type: 'string', description: 'JSON-масив блоків' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' }, slug: { type: 'string' }, status: { type: 'string', enum: ['draft', 'published'] },
                  hero_image: { type: 'string', format: 'binary', description: 'Нове головне зображення (JPEG/PNG, макс 5MB). Має пріоритет над hero_image_url.' },
                  og_image: { type: 'string', format: 'binary', description: 'Нове OG зображення (JPEG/PNG, макс 5MB). Має пріоритет над og_image_url.' },
                  hero_image_url: { type: 'string', description: 'URL hero зображення (використовується, якщо не передано файл)' },
                  og_image_url: { type: 'string', description: 'URL OG зображення (використовується, якщо не передано файл)' },
                  hero_title: { type: 'string' }, hero_subtitle: { type: 'string' },
                  hero_tags: { type: 'string' }, hero_location: { type: 'string' }, hero_year: { type: 'string' },
                  seo_title: { type: 'string' }, seo_description: { type: 'string' },
                  gallery_images: { type: 'string' }, blocks: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Пост оновлено', content: { 'application/json': { schema: { $ref: '#/components/schemas/PostWithBlocks' } } } },
          '400': { description: 'Помилка валідації', content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/Error' }, { $ref: '#/components/schemas/ValidationError' }] } } } },
          '401': { description: 'Неавторизовано', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Пост не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Помилка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        summary: 'Видалити пост',
        description: 'Видаляє пост за ID',
        tags: ['Posts'],
        security: [{ ApiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID поста' }],
        responses: {
          '200': { description: 'Пост видалено', content: { 'application/json': { schema: { $ref: '#/components/schemas/DeleteResponse' }, example: { message: 'Post deleted successfully' } } } },
          '401': { description: 'Неавторизовано', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Пост не знайдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '500': { description: 'Помилка сервера', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};
