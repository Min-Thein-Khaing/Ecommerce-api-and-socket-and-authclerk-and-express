import { Request, Response } from "express";
import Product from "../models/product.model.js";

export const getProducts = async (req: Request, res: Response) => {
  // 1. Parse and sanitize query parameters
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);

  // 2. Fetch data and count in parallel for better performance
  const [products, total] = await Promise.all([
    Product.find({ isArchived: false })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments({ isArchived: false })
  ]);

  // 3. Calculate pagination boundaries
  const lastPages = Math.ceil(total / limit);
  const from = total > 0 ? (page - 1) * limit + 1 : null;
  const to = total > 0 ? Math.min(page * limit, total) : null;

  // 4. Construct base URL path (e.g., http://localhost:3000/api/products)
  const path = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;

  return res.json({
    // Laravel data wrapper
    data: products, 
    
    // Laravel links structure
    links: {
      first: `${path}?page=1`,
      last: `${path}?page=${lastPages}`,
      prev: page > 1 ? `${path}?page=${page - 1}` : null,
      next: page < lastPages ? `${path}?page=${page + 1}` : null,
    },
    
    // Laravel meta structure
    meta: {
      current_page: page,
      from: from,
      last_page: lastPages,
      links: [
        { url: page > 1 ? `${path}?page=${page - 1}` : null, label: "&laquo; Previous", active: false },
        { url: `${path}?page=${page}`, label: `${page}`, active: true },
        { url: page < lastPages ? `${path}?page=${page + 1}` : null, label: "Next &raquo;", active: false }
      ],
      path: path,
      per_page: limit,
      to: to,
      total: total,
    }
  });
};