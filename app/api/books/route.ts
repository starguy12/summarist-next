import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract all potential frontend query parameters
  const status = searchParams.get("status");
  const id = searchParams.get("id");
  const search = searchParams.get("search");

  // Define your base live Google Cloud Function domain
  const BASE_URL = "https://cloudfunctions.net";
  let apiUrl = "";

  try {
    // 1. Check for Book ID Configuration (https://.../getBook?id=\${id})
    if (id) {
      apiUrl = `${BASE_URL}/getBook?id=${id}`;
    } 
    // 2. Check for Search Configuration (https://.../getBooksByAuthorOrTitle?search=\${search})
    else if (search) {
      apiUrl = `${BASE_URL}/getBooksByAuthorOrTitle?search=${encodeURIComponent(search)}`;
    } 
    // 3. Check for Rows Configuration (selected, recommended, suggested)
    else if (status) {
      apiUrl = `${BASE_URL}/getBooks?status=${status}`;
    } 
    // Fallback default row if the frontend forgets to pass a parameter
    else {
      apiUrl = `${BASE_URL}/getBooks?status=recommended`;
    }

    // Execute the configured fetch call
    const response = await fetch(apiUrl, { 
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      console.error(`GCP Cloud Function error status: ${response.status}`);
      return NextResponse.json({ error: "Upstream API failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Backend Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
