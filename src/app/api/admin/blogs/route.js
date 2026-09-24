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

export function normalizeBlogJSON(blog) {
  if (!blog) return blog;
  const b = typeof blog.toJSON === "function" ? blog.toJSON() : { ...blog };
  const jsonFields = [
    "journeyRoute", "journeyStats", "placesExplored", "placesCovered",
    "foodDishes", "foodPlaces", "topItems", "highlights", "quickInfo",
    "tips", "experience", "tripSnapshot", "seo",
  ];
  for (const key of jsonFields) {
    const val = b[key];
    if (typeof val === "string") {
      try { b[key] = JSON.parse(val); } catch { /* leave as-is */ }
    }
  }
  return b;
}

// GET /api/admin/blogs
export async function GET(request) {
  try {
    await ensureDb();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const blogType = searchParams.get("blogType") || "";
    const status = searchParams.get("status") || "";

    const limit = Number.parseInt(
      searchParams.get("limit") || "50",
      10
    );

    const offset = Number.parseInt(
      searchParams.get("offset") || "0",
      10
    );

    const sort = searchParams.get("sort") || "createdAt";
    const order =
      (searchParams.get("order") || "DESC").toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const whereConditions = [];

    // Search
    if (search.trim()) {
      const q = `%${search.trim()}%`;

      whereConditions.push({
        [Op.or]: [
          { title: { [Op.like]: q } },
          { excerpt: { [Op.like]: q } },
          { content: { [Op.like]: q } },
          { category: { [Op.like]: q } },
        ],
      });
    }

    // Category
    if (
      category.trim() &&
      category.trim().toLowerCase() !== "all"
    ) {
      const catVal = category.trim();

      whereConditions.push({
        category: {
          [Op.like]: `%${catVal}%`,
        },
      });
    }

    // Blog type
    if (
      blogType.trim() &&
      blogType.trim().toLowerCase() !== "all"
    ) {
      whereConditions.push({
        blogType: blogType.trim(),
      });
    }

    // Status
    if (
      status.trim() &&
      status.trim().toLowerCase() !== "all"
    ) {
      whereConditions.push({
        status: status.trim(),
      });
    }

    const where =
      whereConditions.length > 0
        ? { [Op.and]: whereConditions }
        : {};

    // Prevent invalid column from being passed to Sequelize
    const allowedSortFields = [
      "id",
      "title",
      "createdAt",
      "updatedAt",
      "publishDate",
      "status",
      "blogType",
      "category",
    ];

    const safeSort = allowedSortFields.includes(sort)
      ? sort
      : "createdAt";

    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(limit, 100)
        : 50;

    const safeOffset =
      Number.isFinite(offset) && offset >= 0
        ? offset
        : 0;

    const { count, rows } = await Blog.findAndCountAll({
      where,
      limit: safeLimit,
      offset: safeOffset,
      order: [[safeSort, order]],
    });

    return NextResponse.json({
      success: true,
      total: count,
      blogs: rows.map(normalizeBlogJSON),
    });
  } catch (error) {
    console.error("GET /api/admin/blogs error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs
export async function POST(request) {
  try {
    await ensureDb();

    const data = await request.json();

    if (!data.title || !data.title.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Blog title is required",
        },
        { status: 400 }
      );
    }

    let slug = String(data.slug || "").trim();

    if (!slug) {
      slug = slugify(data.title);
    } else {
      slug = slugify(slug);
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate blog slug",
        },
        { status: 400 }
      );
    }

    // Ensure unique slug
    const baseSlug = slug;

    let existingSlug = await Blog.findOne({
      where: { slug },
    });

    let count = 1;

    while (existingSlug) {
      slug = `${baseSlug}-${count}`;

      existingSlug = await Blog.findOne({
        where: { slug },
      });

      count++;
    }

    const newBlog = await Blog.create({
      title: data.title.trim(),
      slug,

      blogType: data.blogType || "top_list",
      category: data.category || "Destinations",
      categoryId: data.categoryId || null,

      excerpt: data.excerpt || "",
      content: data.content || "",

      coverImage:
        data.coverImage ||
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",

      author:
        data.author || "Bharat Yatra Editorial",

      readTime:
        data.readTime || "6 min read",

      rating:
        data.rating || "4.8",

      ratingCount:
        data.ratingCount ?? 100,

      publishDate:
        data.publishDate ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

      status:
        data.status || "Published",

      topItems:
        Array.isArray(data.topItems)
          ? data.topItems
          : [],

      highlights:
        Array.isArray(data.highlights)
          ? data.highlights
          : [],

      quickInfo:
        Array.isArray(data.quickInfo)
          ? data.quickInfo
          : [],

      placesExplored:
        Array.isArray(data.placesExplored)
          ? data.placesExplored
          : [],

      placesCovered:
        Array.isArray(data.placesCovered)
          ? data.placesCovered
          : [],

      journeyRoute:
        Array.isArray(data.journeyRoute)
          ? data.journeyRoute
          : [],

      journeyStats:
        data.journeyStats || {},

      foodDishes:
        Array.isArray(data.foodDishes)
          ? data.foodDishes
          : [],

      foodPlaces:
        Array.isArray(data.foodPlaces)
          ? data.foodPlaces
          : [],

      tips:
        Array.isArray(data.tips)
          ? data.tips
          : [],

      tipsImage:
        data.tipsImage || null,

      experience:
        data.experience || {},

      tripSnapshot:
        data.tripSnapshot || {},

      seo:
        data.seo || {},
    });

    return NextResponse.json(
      {
        success: true,
        message: "Blog created successfully",
        blog: normalizeBlogJSON(newBlog),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/blogs error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}