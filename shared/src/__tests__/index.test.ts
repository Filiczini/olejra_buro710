import { describe, it, expect } from "vitest";
import { transliterate, generateSlug } from "../transliterate.js";
import {
  postCreateSchema,
  postUpdateSchema,
  blockSchema,
} from "../schemas/post.js";
import { contactSchema } from "../schemas/contact.js";
import { loginSchema } from "../schemas/auth.js";

// ─── transliterate ──────────────────────────────────────────────────────────

describe("transliterate", () => {
  it("transliterates basic Ukrainian text", () => {
    expect(transliterate("привіт")).toBe("pryvit");
  });

  it("transliterates all Ukrainian-specific letters", () => {
    expect(transliterate("ґ")).toBe("g");
    expect(transliterate("є")).toBe("ye");
    expect(transliterate("ї")).toBe("yi");
    expect(transliterate("і")).toBe("i");
    expect(transliterate("ь")).toBe("");
  });

  it("transliterates complex combinations", () => {
    expect(transliterate("щ")).toBe("shch");
    expect(transliterate("ж")).toBe("zh");
    expect(transliterate("х")).toBe("kh");
    expect(transliterate("ц")).toBe("ts");
    expect(transliterate("ч")).toBe("ch");
    expect(transliterate("ш")).toBe("sh");
    expect(transliterate("ю")).toBe("yu");
    expect(transliterate("я")).toBe("ya");
  });

  it("converts uppercase to lowercase", () => {
    expect(transliterate("ПРИВІТ")).toBe("pryvit");
    expect(transliterate("Київ")).toBe("kyyiv");
  });

  it("returns empty string for empty input", () => {
    expect(transliterate("")).toBe("");
  });

  it("passes through Latin characters unchanged", () => {
    expect(transliterate("hello")).toBe("hello");
  });

  it("passes through digits unchanged", () => {
    expect(transliterate("123")).toBe("123");
  });

  it("passes through special characters unchanged", () => {
    expect(transliterate("!@#$%")).toBe("!@#$%");
  });

  it("handles mixed Ukrainian and Latin text", () => {
    expect(transliterate("hello привіт")).toBe("hello pryvit");
  });

  it("handles mixed text with digits and special chars", () => {
    expect(transliterate("тест 123!")).toBe("test 123!");
  });

  it("transliterates a full Ukrainian sentence", () => {
    expect(transliterate("бюро дизайну")).toBe("byuro dyzaynu");
  });
});

// ─── generateSlug ───────────────────────────────────────────────────────────

describe("generateSlug", () => {
  it("generates a slug from a Ukrainian title", () => {
    expect(generateSlug("Привіт Світ")).toBe("pryvit-svit");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("hello world")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(generateSlug("hello! world?")).toBe("hello-world");
  });

  it("collapses multiple special chars into a single hyphen", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
    expect(generateSlug("hello   world")).toBe("hello-world");
    expect(generateSlug("hello!@#world")).toBe("hello-world");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("--hello--")).toBe("hello");
    expect(generateSlug("!hello!")).toBe("hello");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });

  it("returns empty string for input with only special chars", () => {
    expect(generateSlug("!@#$%^&*()")).toBe("");
  });

  it("handles Ukrainian title with numbers", () => {
    expect(generateSlug("Проект 2024")).toBe("proekt-2024");
  });

  it("converts everything to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("handles a realistic Ukrainian post title", () => {
    expect(generateSlug("Дизайн інтер'єру квартири")).toBe(
      "dyzayn-inter-yeru-kvartyry",
    );
  });
});

// ─── blockSchema ────────────────────────────────────────────────────────────

describe("blockSchema", () => {
  it("accepts a valid block", () => {
    const result = blockSchema.safeParse({
      type: "text_full",
      data: { content: "hello" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a block with optional fields", () => {
    const result = blockSchema.safeParse({
      id: "abc-123",
      _tempId: "temp-1",
      type: "image_full",
      data: { url: "https://example.com/img.jpg" },
      sort_order: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid block types", () => {
    const types = [
      "text_full",
      "image_full",
      "text_image",
      "image_text",
      "three_images",
    ] as const;
    for (const type of types) {
      const result = blockSchema.safeParse({ type, data: {} });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid block type", () => {
    const result = blockSchema.safeParse({
      type: "invalid_type",
      data: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects a block without data", () => {
    const result = blockSchema.safeParse({ type: "text_full" });
    expect(result.success).toBe(false);
  });

  it("rejects a block without type", () => {
    const result = blockSchema.safeParse({ data: {} });
    expect(result.success).toBe(false);
  });
});

// ─── postCreateSchema ───────────────────────────────────────────────────────

describe("postCreateSchema", () => {
  it("accepts a minimal valid post", () => {
    const result = postCreateSchema.safeParse({ title: "Test Post" });
    expect(result.success).toBe(true);
  });

  it("accepts a fully populated post", () => {
    const result = postCreateSchema.safeParse({
      title: "Test Post",
      slug: "test-post",
      status: "published",
      featured: true,
      seo_title: "SEO Title",
      seo_description: "SEO description text",
      hero_title: "Hero Title",
      hero_subtitle: "Hero Subtitle",
      hero_tags: ["tag1", "tag2"],
      hero_location: "Kyiv",
      hero_year: "2024",
      blocks: [{ type: "text_full", data: { content: "hello" } }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a post without title", () => {
    const result = postCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = postCreateSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a title exceeding 200 characters", () => {
    const result = postCreateSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase letters", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      slug: "Test-Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with spaces", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      slug: "test slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      status: "archived",
    });
    expect(result.success).toBe(false);
  });

  it("rejects seo_title exceeding 60 characters", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      seo_title: "a".repeat(61),
    });
    expect(result.success).toBe(false);
  });

  it("rejects seo_description exceeding 160 characters", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      seo_description: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 15 hero_tags", () => {
    const tags = Array.from({ length: 16 }, (_, i) => `tag${i}`);
    const result = postCreateSchema.safeParse({
      title: "Test",
      hero_tags: tags,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a hero_tag exceeding 20 characters", () => {
    const result = postCreateSchema.safeParse({
      title: "Test",
      hero_tags: ["a".repeat(21)],
    });
    expect(result.success).toBe(false);
  });
});

// ─── postUpdateSchema ───────────────────────────────────────────────────────

describe("postUpdateSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = postUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with just title", () => {
    const result = postUpdateSchema.safeParse({ title: "Updated Title" });
    expect(result.success).toBe(true);
  });

  it("still validates constraints on provided fields", () => {
    const result = postUpdateSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});

// ─── contactSchema ──────────────────────────────────────────────────────────

describe("contactSchema", () => {
  const validContact = {
    name: "John Doe",
    email: "john@example.com",
    subject: "Hello",
    message: "This is a test message.",
  };

  it("accepts a valid contact form", () => {
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...rest } = validContact;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(contactSchema.safeParse({ ...validContact, name: "" }).success).toBe(
      false,
    );
  });

  it("rejects missing email", () => {
    const { email: _, ...rest } = validContact;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      contactSchema.safeParse({ ...validContact, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  it("rejects missing subject", () => {
    const { subject: _, ...rest } = validContact;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...rest } = validContact;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects name exceeding 100 characters", () => {
    expect(
      contactSchema.safeParse({ ...validContact, name: "a".repeat(101) })
        .success,
    ).toBe(false);
  });

  it("rejects email exceeding 200 characters", () => {
    const longEmail = "a".repeat(192) + "@test.com";
    expect(
      contactSchema.safeParse({ ...validContact, email: longEmail }).success,
    ).toBe(false);
  });

  it("rejects message exceeding 5000 characters", () => {
    expect(
      contactSchema.safeParse({ ...validContact, message: "a".repeat(5001) })
        .success,
    ).toBe(false);
  });
});

// ─── loginSchema ────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    expect(loginSchema.safeParse({ password: "secret123" }).success).toBe(
      false,
    );
  });

  it("rejects invalid email format", () => {
    expect(
      loginSchema.safeParse({ email: "not-email", password: "secret123" })
        .success,
    ).toBe(false);
  });

  it("rejects missing password", () => {
    expect(loginSchema.safeParse({ email: "admin@example.com" }).success).toBe(
      false,
    );
  });

  it("rejects empty password", () => {
    expect(
      loginSchema.safeParse({ email: "admin@example.com", password: "" })
        .success,
    ).toBe(false);
  });
});
