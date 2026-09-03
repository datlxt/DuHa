import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RenderMode = "tile_only" | "full_design";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

function normalizeRenderMode(value: unknown): RenderMode {
  return value === "full_design" ? "full_design" : "tile_only";
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeText(value: unknown) {
  return textValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizedRoomType(project: Record<string, unknown>) {
  return normalizeText(project.room_type);
}

function isBedroomRoom(project: Record<string, unknown>) {
  const roomType = normalizedRoomType(project);
  return roomType.includes("ngủ") || roomType.includes("ngu") || roomType.includes("bed");
}

function isKitchenRoom(project: Record<string, unknown>) {
  const roomType = normalizedRoomType(project);
  return roomType.includes("bếp") || roomType.includes("bep") || roomType.includes("kitchen");
}

function isOfficeRoom(project: Record<string, unknown>) {
  const roomType = normalizedRoomType(project);
  return roomType.includes("làm việc") || roomType.includes("lam viec") || roomType.includes("office");
}

function styleInstructions(project: Record<string, unknown>) {
  const style = normalizeText(project.style);

  if (style.includes("toi gian") || style.includes("minimal")) {
    return [
      "Selected style is Minimal. Use a calm minimal palette: white, warm off-white, light grey, pale wood, matte black only as small accents.",
      "Furniture must be simple, low-detail, handleless or very clean-lined, with very little decor and no ornate trim.",
      "Avoid luxury gold, heavy decorative wall panels, busy textures and saturated colors.",
    ];
  }

  if (style.includes("am ap") || style.includes("cozy") || style.includes("warm")) {
    return [
      "Selected style is Warm Cozy. Use warm beige, cream, greige, soft wood, linen fabric, warm curtains and layered warm lighting.",
      "Furniture should feel soft and comfortable, with textiles, bedside lamps or pendant/cove lighting where appropriate.",
      "Avoid cold grey dominant palettes, glossy black-heavy materials and overly sparse minimal styling.",
    ];
  }

  if (style.includes("sang trong") || style.includes("lux")) {
    return [
      "Selected style is Luxury. Use refined materials such as marble-look wall/backsplash accents, bronze or champagne metal details, darker premium wood and layered lighting.",
      "Furniture should look premium and tailored, with elegant proportions and a more polished hotel-like feeling.",
      "Avoid cheap generic furniture, plain all-white rooms and overly casual decor.",
    ];
  }

  if (style.includes("nha pho") || style.includes("viet nam") || style.includes("vietnam")) {
    return [
      "Selected style is Vietnamese townhouse. Use practical compact built-ins, bright neutral walls, warm wood cabinetry, simple curtains and durable easy-clean surfaces.",
      "Keep circulation efficient for a narrow urban home and avoid oversized furniture that blocks the room.",
      "Avoid grand hotel luxury or large suburban showroom layouts.",
    ];
  }

  return [
    "Selected style is Modern. Use clean lines, balanced neutral walls, warm wood accents, simple built-in furniture, black or bronze details used sparingly and soft indirect lighting.",
    "The result should feel current, tidy and practical, not overly ornate and not too empty.",
  ];
}

function roomSpecificFurniture(project: Record<string, unknown>) {
  if (isBedroomRoom(project)) {
    return [
      "This is a bedroom. Add bedroom furniture only: bed with headboard, bedside tables, wardrobe or dresser, soft curtains, warm bedside lighting and restrained bedroom decor.",
      "Do not add living-room furniture such as sofa set, coffee table, TV wall, TV console, lounge chairs or oversized plants unless already present in the source photo.",
      "Place the bed against a real existing wall and keep the original window/door circulation clear.",
      "Furniture is movable staging only: it must fit the existing walls, corners, openings and camera perspective from the source image.",
    ];
  }

  if (isKitchenRoom(project)) {
    return [
      "This is a kitchen. Add kitchen furniture only: lower/upper cabinets, countertop, compact dining element and practical task lighting when suitable.",
      "Do not add bedroom bed or living-room sofa furniture.",
    ];
  }

  if (isOfficeRoom(project)) {
    return [
      "This is a work room. Add a desk, ergonomic chair, simple shelving, task lighting and restrained decor.",
      "Do not add bed, sofa set or TV wall unless already present in the source photo.",
    ];
  }

  return [
    "This is a living room. Add a compact sofa set, coffee table, TV console only if it fits an existing wall, curtains if there is an existing window, warm lighting, plants and restrained decor.",
    "Do not add bedroom bed or kitchen cabinets.",
  ];
}

function wallCeilingInstructions(project: Record<string, unknown>) {
  if (isBedroomRoom(project)) {
    return [
      "Finish the unfinished bedroom walls by applying smooth plaster and warm off-white, beige or greige paint to the exact existing wall planes.",
      "Preserve the original wall corners, window size, window location, door location, beam positions and ceiling height.",
      "Add a simple gypsum ceiling or flat finished ceiling with soft cove lighting only as a finish on the exact existing ceiling plane and beams.",
      "Do not leave a striped construction tarp ceiling visible in the final renovated bedroom unless it is structurally impossible to cover.",
      "Use calm bedroom wall decor such as one framed artwork or a subtle headboard wall; do not create a TV feature wall unless requested.",
    ];
  }

  if (isKitchenRoom(project)) {
    return [
      "Finish walls with practical light paint or easy-clean backsplash surfaces suitable for a kitchen, preserving all original wall and window positions.",
      "Cover every visible striped construction tarp, temporary roof sheet, colored plastic sheet or raw ceiling fabric with a clean plain white gypsum/painted ceiling finish.",
      "Use a simple finished white ceiling with practical task lighting following the original ceiling plane, beam faces and soffit geometry.",
      "Do not leave any old red-blue striped tarp or temporary construction sheet visible on the ceiling or upper wall band.",
    ];
  }

  if (isOfficeRoom(project)) {
    return [
      "Finish walls with calm light paint and one restrained accent surface for a work room, preserving the original wall geometry.",
      "Use a simple flat or gypsum ceiling with neutral task lighting.",
    ];
  }

  return [
    "Finish unfinished walls with smooth plaster and light neutral paint, preserving the original wall geometry, windows and doors.",
    "Cover every visible striped construction tarp, temporary roof sheet, colored plastic sheet or raw ceiling fabric with a clean plain white gypsum/painted ceiling finish.",
    "Add a simple gypsum ceiling or clean finished ceiling with warm cove/down lighting following the exact existing ceiling plane, beam faces and soffit geometry.",
    "Do not leave any old red-blue striped tarp or temporary construction sheet visible on the ceiling or upper wall band.",
    "Use restrained wall decor appropriate for the selected style; do not change the architectural layout.",
  ];
}

function surfaceFinishInstruction(surface: string): string {
  const s = surface.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (!s) return "";
  // Glossy / polished / semi-polished finishes (bóng, men bóng, lappato, sugar, polished).
  if (/(bong|gloss|polish|lappato|sugar|men bong)/.test(s)) {
    return "SURFACE FINISH: high-gloss POLISHED tile. Render a smooth, reflective floor with soft mirror-like reflections of the windows, furniture and lights, plus clear specular highlights.";
  }
  // Matte / rough / satin finishes (mờ, mát, nhám, matt).
  if (/(mo|matte|matt|nham|mat)/.test(s)) {
    return "SURFACE FINISH: MATTE tile. Render a non-reflective floor with soft diffuse lighting and no mirror reflections or bright specular highlights.";
  }
  return `SURFACE FINISH: ${surface}. Reproduce this exact finish realistically on the floor.`;
}

function tileReferenceInstructions(project: Record<string, unknown>) {
  const size = textValue(project.tile_size_text) || textValue(project.tile_size);
  const surface = textValue(project.tile_surface_text) || textValue(project.tile_surface);
  const color = textValue(project.tile_color_text) || textValue(project.tile_color);
  const code = textValue(project.tile_code_text) || textValue(project.tile_code);
  const normalizedSize = size.replace(/\s/g, "").toLowerCase();
  const sizeParts = normalizedSize.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/);
  const width = sizeParts ? Number(sizeParts[1]) : 0;
  const height = sizeParts ? Number(sizeParts[2]) : 0;
  const ratio = width && height ? Math.max(width, height) / Math.max(1, Math.min(width, height)) : 1;
  const isSquare = Boolean(width && height && Math.abs(width - height) <= 2);
  // Long narrow strips (15x90, 20x120...). 60x120 is ratio 2.0 -> handled as a large rectangular slab below.
  const isPlank = Boolean(width && height && ratio >= 2.6);
  const isRect = Boolean(width && height && !isSquare && ratio < 2.6);

  return [
    "Tile fidelity is critical.",
    "Use the uploaded tile sample for material color, texture, grain, tone variation and surface finish.",
    "The uploaded tile image is a required product material swatch, not a moodboard or loose style inspiration.",
    "Copy the tile's visual identity as closely as possible: same dominant hue, same grain density, same grain thickness, same vein/wood-fiber rhythm, same contrast and same finish.",
    "If the tile sample contains visible vertical strip/plank bands, alternating light and dark wood panels, or printed block seams, preserve that exact striped/block rhythm in the rendered floor.",
    "Do not convert a striped/blocky wood-look sample into a smooth generic wood floor or a uniform oak texture.",
    "Keep the sample's pale blond wood tone, vertical fiber lines, alternating panel widths and subtle rectangular printed seams when they are visible in the uploaded sample.",
    "Texture fidelity is critical: preserve the distinctive grain lines, color bands, contrast, knots, clouding and direction from the uploaded tile sample.",
    "Do not replace the uploaded tile sample with a generic oak texture, generic marble, generic stone or another catalog material.",
    "Do not invent a smoother, cleaner or more expensive-looking material if it differs from the uploaded product sample.",
    "The generated floor should look like the same product as the uploaded sample after perspective projection.",
    "The chosen tile size metadata controls the physical tile module shape and grout grid, even if the sample image shows a different layout.",
    "Do not blindly copy the sample image layout if it conflicts with the chosen tile size.",
    isSquare
      ? `The selected size ${size} is a square tile. Render a clean square tile grid with equal width and height modules, straight grout lines in both directions, and realistic square tile count across the floor. Use the uploaded sample as the printed material motif inside each square tile. If the sample contains plank/stripe graphics, keep those graphics printed inside the square tile surface, but keep the outer grout grid square. Do not render the entire floor as long loose planks, narrow strips, random small rectangles, broken tile fragments, herringbone, or wood floor boards.`
      : "",
    isPlank
      ? `The selected size ${size} cm is a long PLANK/strip tile. Render long narrow rectangular planks with realistic staggered joints following the room perspective.`
      : "",
    isRect
      ? `The selected size ${size} cm is a LARGE RECTANGULAR floor tile (about ${width}x${height} cm). Render big rectangular tiles laid in a regular grid with the long edge running along the room; only a few large tiles span the floor, separated by wide, straight, evenly spaced grout lines. Do NOT render small squares, narrow strips, mosaic pieces or wood-plank boards.`
      : "",
    !isSquare && !isPlank && !isRect
      ? "Preserve the selected tile aspect ratio and repeat it as individual tiles with visible grout joints."
      : "",
    "The tile pattern must repeat across the floor with realistic scale and perspective, not as one stretched texture.",
    "Every visible tile module must keep the same selected size and aspect ratio across the floor, only changing by perspective distance.",
    "Avoid mismatched small tiles in the middle of the floor; grout spacing must be regular and aligned.",
    "Wood grain or stone veins should follow the uploaded material direction naturally inside each tile, but tile seams must follow the selected module grid.",
    "For square tiles using a wood-grain sample, crop/fit the wood-grain material inside each square tile module; do not invent long wood planks or mixed plank blocks.",
    "Estimate real-world tile count from the floor area and the provided tile size; avoid oversized or undersized tiles.",
    "Respect the tile's real module size when drawing grout spacing and plank/slab length.",
    "Grout joints must be visible enough to communicate tile size and layout, but still realistic.",
    size ? `The tile size ${size} is in CENTIMETERS (real-world). Render tiles at correct physical scale relative to the room, walls, doors and furniture: large-format tiles must clearly look large, with only a few modules across the floor.` : "",
    surfaceFinishInstruction(surface),
    code ? `Catalog/manual tile code: ${code}.` : "",
    size ? `Catalog tile size to respect: ${size} cm.` : "",
    surface ? `Catalog tile surface/finish: ${surface}.` : "",
    color ? `Catalog tile main color: ${color}.` : "",
  ].filter(Boolean);
}

function buildPrompt(project: Record<string, unknown>) {
  const style = textValue(project.style);
  const roomType = textValue(project.room_type) || "room";
  const mode = normalizeRenderMode(project.render_mode);

  const shared = [
    "STRICT SOURCE-LOCKED EDIT.",
    "Use the uploaded room image as the locked base image and the uploaded tile image as the exact floor tile reference.",
    "Preserve the exact source crop, aspect ratio, camera position, camera angle, focal-length feel, vanishing points and perspective.",
    "The output must keep the same landscape/portrait orientation and the same relative framing as the source room photo.",
    "All windows and doors must remain in the same relative pixel location, with the same size, shape and wall relationship as in the source photo.",
    "Preserve the exact room architecture: wall positions, wall corners, floor boundary, ceiling shape, beams, columns, doors, windows, openings, staircase and exterior view through windows.",
    "Do not move, resize, remove, cover, crop out or invent windows, doors, walls, beams, columns, stairs, openings or room boundaries.",
    "Keep the exact ceiling: same ceiling height, shape and beams. Do not add tray ceilings, cove/hidden lighting, coffered panels, wood ceilings or any new ceiling design that is not in the source photo.",
    "Keep the exact room size, floor area, wall lengths and proportions. Do not make the room look larger, smaller, longer, wider or taller than the source photo.",
    "Do not add decorative feature walls such as brick, exposed brick, stone, marble slab, wood-slat or 3D paneling walls unless they already exist in the source photo. Keep the original wall surfaces and only apply smooth neutral paint where an unfinished wall needs finishing.",
    "Do not zoom in, zoom out, rotate the camera, crop differently, restage the scene, or replace the room with a showroom.",
    "Keep the visible room footprint and proportions the same as the source photo.",
    "If unsure, leave architectural elements unchanged rather than redesigning them.",
    "The final image must be recognizably the same input room after renovation.",
    "Install the uploaded tile sample only on the existing floor plane with realistic perspective, scale, grout lines, shadows, reflections and lighting.",
    ...tileReferenceInstructions(project),
    "Do not add labels, banners, borders, watermarks, text overlays, logos or UI elements.",
    "Create a realistic renovation preview of the same room, not a new room concept.",
    `Room type: ${roomType}.`,
    style ? `Interior style: ${style}.` : "",
    ...styleInstructions(project),
  ];

  if (mode === "full_design") {
    return [
      ...shared,
      "Treat the input as a bare or unfinished room that may not have furniture yet.",
      "Do not replace the room with a different showroom or a different interior photo.",
      "Do not move, remove or invent different windows, doors, walls, stairs, beams, ceiling geometry or room boundaries.",
      ...wallCeilingInstructions(project),
      "Add tasteful but minimal furniture and decoration appropriate for the room type and style as movable objects inside the existing geometry.",
      ...roomSpecificFurniture(project),
      "Furniture must adapt to the original room layout; the room architecture must not adapt to the furniture.",
      "Keep furniture layout realistic, walkable and proportional to the room and original camera perspective.",
      "Leave enough of the original floor visible so the installed tile is clear.",
      "Do not hide the floor tile; the tile must remain clearly visible as the main product being presented.",
    ].filter(Boolean).join("\n");
  }

  return [
    ...shared,
    "Keep all existing furniture, wall cladding, TV wall, decorations, lighting and room contents unchanged.",
    "Replace only the floor or unfinished floor area with the uploaded tile sample.",
    "Do not redesign the furniture, wall panels, ceiling, staircase or room structure.",
  ].filter(Boolean).join("\n");
}

function buildAdvice(project: Record<string, unknown>) {
  const style = textValue(project.style) || "hiện đại";
  const roomType = textValue(project.room_type) || "không gian";
  const mode = normalizeRenderMode(project.render_mode);
  const size = textValue(project.tile_size_text) || textValue(project.tile_size);
  const surface = textValue(project.tile_surface_text) || textValue(project.tile_surface);
  const sizeNote = size ? `khổ ${size}` : "đúng khổ đã chọn";
  const surfaceNote = surface ? `bề mặt ${surface.toLowerCase()}` : "bề mặt đã chọn";

  let furniture = "Bố trí nội thất đơn giản, gọn gàng, chừa lối đi thoáng và để lộ nền gạch cho dễ nhìn.";
  let wall = `Nên sơn tường màu trắng ấm, kem hoặc xám nhạt để mẫu gạch nổi bật trong ${roomType.toLowerCase()} phong cách ${style.toLowerCase()}.`;

  if (isBedroomRoom(project)) {
    wall = `Sơn tường phẳng màu trắng ấm, kem hoặc xám nhạt; có thể ốp nhẹ mảng tường sau đầu giường cho hợp phòng ngủ phong cách ${style.toLowerCase()}.`;
    furniture = "Kê giường, táp đầu giường, tủ quần áo hoặc bàn trang điểm nhỏ và rèm mềm; không dùng sofa hay bàn trà phòng khách.";
  } else if (isKitchenRoom(project)) {
    furniture = "Lắp tủ bếp trên và dưới, mặt bàn bếp, khu ăn nhỏ và đèn chiếu chỗ nấu; chừa lối đi thoáng, không kê giường hay sofa.";
  } else if (isOfficeRoom(project)) {
    furniture = "Kê bàn làm việc, ghế ngồi thoải mái, kệ sách gọn và đèn bàn; để lộ mặt sàn gạch cho dễ nhìn.";
  }

  if (mode !== "full_design") {
    furniture = "Giữ nguyên nội thất hiện có, chỉ thêm vài món trang trí nhẹ nếu cần, tránh che mất nền gạch.";
  }

  return JSON.stringify({
    wall,
    furniture,
    lighting: "Dùng ánh sáng vàng ấm dịu, kết hợp đèn trần và vài đèn điểm để mặt gạch trông có chiều sâu.",
    construction: `Lát gạch ${sizeNote}, để mạch ron khoảng 2-3mm và chọn màu ron gần với màu gạch; lát đúng chiều vân và ${surfaceNote}, tránh lát lệch làm méo vân gạch.`,
  });
}

function fallbackAdvice(project: Record<string, unknown>) {
  return buildAdvice(project);
}

async function fetchBlob(url: string, label: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot fetch ${label} image: ${response.status} ${response.statusText}`);
  }
  return await response.blob();
}

async function callOpenAI(roomBlob: Blob, tileBlob: Blob, prompt: string, model: string, count = 1) {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", Deno.env.get("OPENAI_IMAGE_SIZE") ?? "auto");
  form.append("quality", Deno.env.get("OPENAI_IMAGE_QUALITY") ?? "medium");
  // input_fidelity=high forces gpt-image to keep the source room faithfully (walls, ceiling,
  // window positions, proportions) instead of reimagining a new room. Set OPENAI_INPUT_FIDELITY
  // to empty to disable if a model rejects the parameter.
  const inputFidelity = Deno.env.get("OPENAI_INPUT_FIDELITY") ?? "high";
  if (inputFidelity) form.append("input_fidelity", inputFidelity);
  form.append("n", String(count));
  form.append("image[]", roomBlob, "room.png");
  form.append("image[]", tileBlob, "tile.png");

  const timeoutMs = Number(Deno.env.get("OPENAI_IMAGE_TIMEOUT_MS") ?? "115000");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`,
      },
      body: form,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI render quá lâu nên đã tự dừng trước khi Edge Function timeout. Hãy thử lại với ảnh nhỏ hơn hoặc ảnh rõ nhưng nhẹ hơn.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "OpenAI image generation failed.");
  }

  const items: Array<{ b64?: string; url?: string }> = (payload?.data ?? [])
    .map((item: { b64_json?: string; url?: string }) =>
      item?.b64_json ? { b64: item.b64_json } : item?.url ? { url: item.url } : null,
    )
    .filter((item: { b64?: string; url?: string } | null): item is { b64?: string; url?: string } => item !== null);
  if (!items.length) throw new Error("OpenAI did not return an image.");
  return { images: items };
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("DUHA_SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const model = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-2";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) return json({ error: "Unauthorized" }, 401);

    const { project_id } = await req.json();
    if (!project_id) return json({ error: "Missing project_id" }, 400);

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", project_id)
      .eq("user_id", userData.user.id)
      .single();

    if (projectError || !project) throw new Error(projectError?.message ?? "Project not found");
    if (!project.room_image_url) throw new Error("Project is missing room image.");
    if (!project.tile_image_url) throw new Error("Project is missing tile image.");

    let projectForGeneration: Record<string, unknown> = project;
    if (project.tile_id) {
      const { data: tile } = await supabase
        .from("tiles")
        .select("tile_code,tile_name,size,surface,main_color")
        .eq("id", project.tile_id)
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (tile) {
        projectForGeneration = {
          ...project,
          tile_code: project.tile_code_text || tile.tile_code,
          tile_name: tile.tile_name,
          tile_size: project.tile_size_text || tile.size,
          tile_surface: project.tile_surface_text || tile.surface,
          tile_color: project.tile_color_text || tile.main_color,
        };
      }
    }

    await supabase.from("projects").update({
      generation_status: "processing",
      generation_error: null,
      ai_model: model,
      status: "AI rendering",
      updated_at: new Date().toISOString(),
    }).eq("id", project.id);

    const [roomBlob, tileBlob] = await Promise.all([
      fetchBlob(project.room_image_url, "room"),
      fetchBlob(project.tile_image_url, "tile"),
    ]);

    // Mỗi model render 1 mẫu để khách có nhiều phương án ĐỘC LẬP (không để 1 model tạo
    // nhiều ảnh). Chỉ dòng gpt-image của OpenAI mới sửa ảnh phòng theo ảnh gạch tham chiếu.
    // Đặt danh sách qua OPENAI_IMAGE_MODELS (ngăn cách bởi dấu phẩy); mặc định 2 model.
    const models: string[] = (Deno.env.get("OPENAI_IMAGE_MODELS") ?? `${model},gpt-image-1`)
      .split(",")
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 0);
    const prompt = buildPrompt(projectForGeneration);
    const adviceText = fallbackAdvice(projectForGeneration);

    // Render song song để 2 model không cộng dồn thời gian gây timeout. Model nào lỗi thì
    // bỏ qua, vẫn giữ các mẫu còn lại.
    const settled = await Promise.allSettled(
      models.map((m: string) =>
        callOpenAI(roomBlob, tileBlob, prompt, m, 1).then((r) => ({ model: m, image: r.images[0] })),
      ),
    );

    const resultUrls: string[] = [];
    const usedModels: string[] = [];
    const errors: string[] = [];
    for (const outcome of settled) {
      if (outcome.status === "rejected") {
        errors.push(outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason));
        continue;
      }
      const { model: usedModel, image } = outcome.value;
      let resultBytes: Uint8Array;
      if (image?.b64) {
        resultBytes = base64ToBytes(image.b64);
      } else if (image?.url) {
        const imageResponse = await fetch(image.url);
        if (!imageResponse.ok) {
          errors.push(`Không tải được ảnh từ ${usedModel}.`);
          continue;
        }
        resultBytes = new Uint8Array(await imageResponse.arrayBuffer());
      } else {
        continue;
      }

      const path = `results/${userData.user.id}/${Date.now()}-${project.id}-${resultUrls.length}.png`;
      const { error: uploadError } = await supabase.storage
        .from("duha-images")
        .upload(path, resultBytes, { contentType: "image/png", upsert: true });
      if (uploadError) throw new Error(uploadError.message);
      resultUrls.push(supabase.storage.from("duha-images").getPublicUrl(path).data.publicUrl);
      usedModels.push(usedModel);
    }

    if (!resultUrls.length) throw new Error(errors[0] ?? "No generated image returned.");

    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        result_image_url: resultUrls[0],
        result_image_urls: resultUrls,
        advice_text: adviceText,
        generation_status: "succeeded",
        generation_error: null,
        ai_model: usedModels.join(", "),
        generated_at: new Date().toISOString(),
        status: "AI rendered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id)
      .select("*")
      .single();

    if (updateError) throw new Error(updateError.message);
    return json({ project: updatedProject });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    try {
      const body = await req.clone().json().catch(() => null);
      if (body?.project_id) {
        await supabase.from("projects").update({
          generation_status: "failed",
          generation_error: message,
          status: "AI render failed",
          updated_at: new Date().toISOString(),
        }).eq("id", body.project_id);
      }
    } catch {
      // Ignore best-effort status update failure.
    }
    return json({ error: message }, 500);
  }
});
