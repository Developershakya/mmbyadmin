import { NextResponse } from "next/server";
import Blog from "@/models/Blog";
import { normalizeBlogJSON } from "../../admin/blogs/route";

export async function GET(request, { params }) {
  try {
   
    const { slugOrId } = await params;

    let blog = null;

  
    if (/^\d+$/.test(slugOrId)) {
      blog = await Blog.findByPk(parseInt(slugOrId, 10));
    }
    

    if (!blog) {
      blog = await Blog.findOne({
        where: { slug: slugOrId }
      });
    }


    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true,  blog: normalizeBlogJSON(blog) },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error fetching blog detail:', err);
    return NextResponse.json(
      { success: false, error: err.message }, 
      { status: 500 }
    );
  }
}
