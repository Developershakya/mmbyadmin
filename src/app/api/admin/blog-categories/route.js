import { NextResponse } from "next/server";
import { Op } from "sequelize";

import Blog from "@/models/BlogCategory";
import BlogCategory from "@/models/BlogCategory";
import sequelize from "@/config/sequelize";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDb() {
  await sequelize.authenticate();
}

// GET /api/admin/blog-categories
export async function GET() {
  try {
    await ensureDb();

    const categories = await BlogCategory.findAll({
      order: [["id", "ASC"]],
    });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Blog.count({
          where: {
            [Op.or]: [
              {
                name: cat.name,
              },
              {
                id: cat.id,
              },
            ],
          },
        });

        return {
          ...cat.toJSON(),
          postCount: count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/blog-categories error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog-categories
export async function POST(request) {
  try {
    await ensureDb();

    const data = await request.json();

    const name = String(data.name || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Category name is required",
        },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Duplicate check
    const existing = await BlogCategory.findOne({
      where: {
        [Op.or]: [
          { name },
          { slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Category already exists",
        },
        { status: 409 }
      );
    }

    const newCategory = await BlogCategory.create({
      name,
      slug,
      description: data.description
        ? String(data.description).trim()
        : "",
      icon: data.icon || "Compass",
      status: data.status || "Active",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        category: {
          ...newCategory.toJSON(),
          postCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/blog-categories error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}