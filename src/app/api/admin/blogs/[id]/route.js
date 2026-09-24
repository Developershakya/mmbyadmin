import { NextResponse } from "next/server";
import { Op } from "sequelize";

import Blog from "@/models/Blog";
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

// GET /api/admin/blogs/:id
// ID ya slug dono support karega
export async function GET(request, { params }) {
  try {
    await ensureDb();

    const { id } = await params;

    let blog = null;

    // Numeric ID
    if (/^\d+$/.test(id)) {
      blog = await Blog.findByPk(
        Number.parseInt(id, 10)
      );
    }

    // Slug
    if (!blog) {
      blog = await Blog.findOne({
        where: {
          slug: id,
        },
      });
    }

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error: "Blog not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error("GET blog detail error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blogs/:id
export async function PUT(request, { params }) {
  try {
    await ensureDb();

    const { id } = await params;

    const blogId = Number.parseInt(id, 10);

    if (!Number.isInteger(blogId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid blog ID",
        },
        { status: 400 }
      );
    }

    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error: "Blog not found",
        },
        { status: 404 }
      );
    }

    const data = await request.json();

    let slug =
      data.slug !== undefined
        ? String(data.slug || "").trim()
        : blog.slug;

    if (!slug && data.title) {
      slug = slugify(data.title);
    }

    slug = slugify(slug);

    // Check slug only when changed
    if (slug !== blog.slug) {
      const existing = await Blog.findOne({
        where: {
          slug,
          id: {
            [Op.ne]: blogId,
          },
        },
      });

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData = {
      title:
        data.title !== undefined
          ? String(data.title).trim()
          : blog.title,

      slug,

      blogType:
        data.blogType !== undefined
          ? data.blogType
          : blog.blogType,

      category:
        data.category !== undefined
          ? data.category
          : blog.category,

      categoryId:
        data.categoryId !== undefined
          ? data.categoryId
          : blog.categoryId,

      excerpt:
        data.excerpt !== undefined
          ? data.excerpt
          : blog.excerpt,

      content:
        data.content !== undefined
          ? data.content
          : blog.content,

      coverImage:
        data.coverImage !== undefined
          ? data.coverImage
          : blog.coverImage,

      author:
        data.author !== undefined
          ? data.author
          : blog.author,

      readTime:
        data.readTime !== undefined
          ? data.readTime
          : blog.readTime,

      rating:
        data.rating !== undefined
          ? data.rating
          : blog.rating,

      ratingCount:
        data.ratingCount !== undefined
          ? data.ratingCount
          : blog.ratingCount,

      publishDate:
        data.publishDate !== undefined
          ? data.publishDate
          : blog.publishDate,

      status:
        data.status !== undefined
          ? data.status
          : blog.status,

      topItems:
        data.topItems !== undefined
          ? data.topItems
          : blog.topItems,

      highlights:
        data.highlights !== undefined
          ? data.highlights
          : blog.highlights,

      quickInfo:
        data.quickInfo !== undefined
          ? data.quickInfo
          : blog.quickInfo,

      placesExplored:
        data.placesExplored !== undefined
          ? data.placesExplored
          : blog.placesExplored,

      placesCovered:
        data.placesCovered !== undefined
          ? data.placesCovered
          : blog.placesCovered,

      journeyRoute:
        data.journeyRoute !== undefined
          ? data.journeyRoute
          : blog.journeyRoute,

      journeyStats:
        data.journeyStats !== undefined
          ? data.journeyStats
          : blog.journeyStats,

      foodDishes:
        data.foodDishes !== undefined
          ? data.foodDishes
          : blog.foodDishes,

      foodPlaces:
        data.foodPlaces !== undefined
          ? data.foodPlaces
          : blog.foodPlaces,

      tips:
        data.tips !== undefined
          ? data.tips
          : blog.tips,

      tipsImage:
        data.tipsImage !== undefined
          ? data.tipsImage
          : blog.tipsImage,

      experience:
        data.experience !== undefined
          ? data.experience
          : blog.experience,

      tripSnapshot:
        data.tripSnapshot !== undefined
          ? data.tripSnapshot
          : blog.tripSnapshot,

      seo:
        data.seo !== undefined
          ? data.seo
          : blog.seo,
    };

    await blog.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("PUT blog error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blogs/:id
export async function DELETE(request, { params }) {
  try {
    await ensureDb();

    const { id } = await params;

    const blogId = Number.parseInt(id, 10);

    if (!Number.isInteger(blogId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid blog ID",
        },
        { status: 400 }
      );
    }

    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error: "Blog not found",
        },
        { status: 404 }
      );
    }

    await blog.destroy();

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("DELETE blog error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}