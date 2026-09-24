import { NextResponse } from "next/server";

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

// PUT /api/admin/blog-categories/:id
export async function PUT(request, { params }) {
  try {
    await ensureDb();

    const { id } = await params;

    const categoryId = Number.parseInt(id, 10);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category = await BlogCategory.findByPk(categoryId);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    const data = await request.json();

    const updateData = {};

    if (data.name !== undefined) {
      const name = String(data.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: "Category name is required",
          },
          { status: 400 }
        );
      }

      updateData.name = name;
      updateData.slug = slugify(name);
    }

    if (data.description !== undefined) {
      updateData.description = String(
        data.description || ""
      ).trim();
    }

    if (data.icon !== undefined) {
      updateData.icon = data.icon;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    await category.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(
      "PUT blog category error:",
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

// DELETE /api/admin/blog-categories/:id
export async function DELETE(request, { params }) {
  try {
    await ensureDb();

    const { id } = await params;

    const categoryId = Number.parseInt(id, 10);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
        },
        { status: 400 }
      );
    }

    const category = await BlogCategory.findByPk(categoryId);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
        },
        { status: 404 }
      );
    }

    await category.destroy();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE blog category error:",
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