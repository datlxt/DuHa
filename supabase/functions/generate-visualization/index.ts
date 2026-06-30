import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

type RenderMode = "tile_only" | "full_design";

function normalizeRenderMode(value: unknown): RenderMode {
  return value === "full_design" ? "full_design" : "tile_only";
}

function normalizedRoomType(project: Record<string, unknown>) {
  return typeof project.room_type === "string" ? project.room_type.toLowerCase() : "";
}

function roomSpecificFurniture(project: Record<string, unknown>) {
  const roomType = normalizedRoomType(project);
  if (roomType.includes("ngủ") || roomType.includes("bed")) {
    return [
      "This is a bedroom. Add bedroom furniture only: a bed with headboard, bedside tables, wardrobe or dresser, soft curtains, warm bedside lighting and restrained decor.",
      "Do not add living-room furniture such as sofa set, coffee table, TV wall, TV console, lounge chairs or large plants unless already present in the source photo.",
      "Place the bed against a real existing wall and keep the window/door circulation clear.",
    ];
  }
  if (roomType.includes("bếp") || roomType.includes("kitchen")) {
    return [
      "This is a kitchen. Add kitchen furniture only: lower/upper cabinets, countertop, compact dining element and practical task lighting when suitable.",
      "Do not add bedroom bed or living-room sofa furniture.",
    ];
  }
  if (roomType.includes("làm việc") || roomType.includes("office")) {
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
  const roomType = normalizedRoomType(project);
  if (roomType.includes("ngủ") || roomType.includes("bed")) {
    return [
      "Finish the unfinished bedroom walls with smooth plaster and warm off-white, beige or greige paint, while preserving the original wall geometry and openings.",
      "Add a simple gypsum ceiling or flat finished ceiling with soft cove lighting only if it follows the exact existing ceiling plane and beams.",
      "Do not leave the striped construction tarp ceiling visible in the final renovated bedroom unless it is structurally impossible to cover.",
      "Use calm bedroom wall decor such as one framed artwork or a subtle headboard wall; do not create a TV feature wall unless requested.",
    ];
  }
  if (roomType.includes("bếp") || roomType.includes("kitchen")) {
    return [
      "Finish walls with practical light paint or easy-clean backsplash surfaces suitable for a kitchen, preserving all original wall and window positions.",
      "Use a simple finished ceiling with practical task lighting following the original ceiling plane.",
    ];
  }
  if (roomType.includes("làm việc") || roomType.includes("office")) {
    return [
      "Finish walls with calm light paint and one restrained accent surface for a work room, preserving the original wall geometry.",
      "Use a simple flat or gypsum ceiling with neutral task lighting.",
    ];
  }
  return [
    "Finish unfinished walls with smooth plaster and light neutral paint, preserving the original wall geometry, windows and doors.",
    "Add a simple gypsum ceiling or clean finished ceiling with warm cove/down lighting following the exact existing ceiling plane.",
    "Use restrained wall decor appropriate for the selected style; do not change the architectural layout.",
  ];
}

function tileReferenceInstructions(project: Record<string, unknown>) {
  const size =
    typeof project.tile_size_text === "string" && project.tile_size_text
      ? project.tile_size_text
      : typeof project.tile_size === "string" ? project.tile_size : "";
  const surface =
    typeof project.tile_surface_text === "string" && project.tile_surface_text
      ? project.tile_surface_text
      : typeof project.tile_surface === "string" ? project.tile_surface : "";
  const color =
    typeof project.tile_color_text === "string" && project.tile_color_text
      ? project.tile_color_text
      : typeof project.tile_color === "string" ? project.tile_color : "";
  const code = typeof project.tile_code_text === "string" && project.tile_code_text
    ? project.tile_code_text
    : typeof project.tile_code === "string" ? project.tile_code : "";
  const normalizedSize = size.replace(/\s/g, "").toLowerCase();
  const sizeParts = normalizedSize.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/);
  const width = sizeParts ? Number(sizeParts[1]) : 0;
  const height = sizeParts ? Number(sizeParts[2]) : 0;
  const isSquare = Boolean(width && height && Math.abs(width - height) <= 2);
  const isPlank = Boolean(width && height && Math.max(width, height) / Math.max(1, Math.min(width, height)) >= 2.2);

  return [
    "Tile fidelity is critical.",
    "Use the uploaded tile sample for material color, texture, grain, tone variation and surface finish.",
    "The chosen tile size metadata controls the physical tile module shape and grout grid, even if the sample image shows a different layout.",
    "Do not blindly copy the sample image layout if it conflicts with the chosen tile size.",
    isSquare
      ? `The selected size ${size} is a square tile. Render a square tile grid with equal width and height modules, straight grout lines in both directions, and realistic square tile count across the floor. Do not render long planks, narrow strips, herringbone, or wood floor boards.`
      : "",
    isPlank
      ? `The selected size ${size} is a plank tile. Render long rectangular planks with realistic staggered joints following the room perspective.`
      : "",
    !isSquare && !isPlank
      ? "Preserve the selected tile aspect ratio and repeat it as individual tiles with visible grout joints."
      : "",
    "The tile pattern must repeat across the floor with realistic scale and perspective, not as one stretched texture.",
    "Estimate real-world tile count from the floor area and the provided tile size; avoid oversized or undersized tiles.",
    "Respect the tile's real module size when drawing grout spacing and plank/slab length.",
    "Grout joints must be visible enough to communicate tile size and layout, but still realistic.",
    code ? `Catalog/manual tile code: ${code}.` : "",
    size ? `Catalog tile size to respect: ${size}.` : "",
    surface ? `Catalog tile surface/finish: ${surface}.` : "",
    color ? `Catalog tile main color: ${color}.` : "",
  ].filter(Boolean);
}

function buildPrompt(project: Record<string, unknown>) {
  const style = typeof project.style === "string" ? project.style : "";
  const roomType = typeof project.room_type === "string" ? project.room_type : "room";
  const mode = normalizeRenderMode(project.render_mode);

  const shared = [
    "Use the uploaded room image as the base image and the uploaded tile image as the exact floor tile reference.",
    "Preserve the exact room architecture, camera angle, perspective, wall positions, ceiling shape, doors, windows, openings, columns and staircase.",
    "Keep the visible room footprint and proportions the same as the source photo.",
    "Install the uploaded tile sample only on the existing floor plane with realistic perspective, scale, grout lines, shadows, reflections and lighting.",
    ...tileReferenceInstructions(project),
    "Do not add labels, banners, borders, watermarks, text overlays, logos or UI elements.",
    "Create a realistic renovation preview of the same room, not a new room concept.",
    `Room type: ${roomType}.`,
    style ? `Interior style: ${style}.` : "",
  ];

  if (mode === "full_design") {
    return [
      ...shared,
      "Treat the input as a bare or unfinished room that may not have furniture yet.",
      "Do not replace the room with a different showroom or a different interior photo.",
      "Do not move, remove or invent different windows, doors, walls, stairs or room boundaries.",
      ...wallCeilingInstructions(project),
      "Add tasteful but minimal furniture and decoration appropriate for the room type and style.",
      ...roomSpecificFurniture(project),
      "Keep furniture layout realistic, walkable and proportional to the room.",
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
  const style = typeof project.style === "string" ? project.style : "hien dai";
  const roomType = typeof project.room_type === "string" ? project.room_type : "khong gian";
  const mode = normalizeRenderMode(project.render_mode);
  const normalized = normalizedRoomType(project);
  const furnitureAdvice = normalized.includes("ngủ")
    ? "NOI_THAT: Bo tri giuong ngu, tab dau giuong, tu quan ao hoac ban trang diem nho; dung rem mem va decor tiet che, khong dung sofa/ban tra phong khach."
    : normalized.includes("bếp")
      ? "NOI_THAT: Bo tri he tu bep, mat bep, khu an nho va den thao tac; giu loi di thong thoang, khong dung giuong/sofa phong khach."
      : normalized.includes("làm việc")
        ? "NOI_THAT: Bo tri ban lam viec, ghe cong thai hoc, ke sach gon va den lam viec; giu mat san gach duoc nhin ro."
        : "NOI_THAT: Bo tri noi that trung tinh, go am hoac den nham; them sofa/ban tra/ke TV/rem/cay xanh neu dung voi phong khach, giu loi di thoang.";

  if (mode === "full_design") {
    return [
      `MAU_TUONG: Uu tien trang am, ghi nhat hoac kem de mau gach noi bat trong ${roomType.toLowerCase()} phong cach ${style.toLowerCase()}.`,
      furnitureAdvice,
      "ANH_SANG: Dung anh sang vang am 3000K-3500K, ket hop den tran va den diem nhe de mat gach co chieu sau.",
      "THI_CONG: Lat gach dung kho va dung huong van cua mau, khong keo gian texture; ron 2mm-3mm, mau ron gan tone gach.",
    ].join("\n");
  }

  return [
    `MAU_TUONG: Giu tuong trang am, ghi nhat hoac kem de nen gach trong sang va that mau trong ${roomType.toLowerCase()}.`,
    "NOI_THAT: Giu noi that hien co, chi nen them decor nhe; tranh vat lieu co van qua manh neu mau gach da noi bat.",
    "ANH_SANG: Can bang anh sang trung tinh hoac vang am de be mat gach khong bi xanh/loang mau.",
    "THI_CONG: Lat dung kho gach, dung huong van va pattern cua mau; kiem tra ron va do phang nen truoc khi thi cong dai tra.",
  ].join("\n");
}

function fallbackAdvice(project: Record<string, unknown>) {
  return buildAdvice(project);
}

function parseAdvicePayload(value: unknown, project: Record<string, unknown>) {
  if (!value || typeof value !== "object") return fallbackAdvice(project);
  const payload = value as Record<string, unknown>;
  const wall = typeof payload.wall === "string" ? payload.wall : "";
  const furniture = typeof payload.furniture === "string" ? payload.furniture : "";
  const lighting = typeof payload.lighting === "string" ? payload.lighting : "";
  const construction = typeof payload.construction === "string" ? payload.construction : "";

  if (!wall || !furniture || !lighting || !construction) return fallbackAdvice(project);

  return [
    `MAU_TUONG: ${wall}`,
    `NOI_THAT: ${furniture}`,
    `ANH_SANG: ${lighting}`,
    `THI_CONG: ${construction}`,
  ].join("\n");
}

async function callDesignAdvice(project: Record<string, unknown>) {
  const model = Deno.env.get("OPENAI_TEXT_MODEL") ?? "gpt-4.1-mini";
  const mode = normalizeRenderMode(project.render_mode);
  const roomUrl = typeof project.room_image_url === "string" ? project.room_image_url : "";
  const tileUrl = typeof project.tile_image_url === "string" ? project.tile_image_url : "";
  const roomType = typeof project.room_type === "string" ? project.room_type : "khong gian";
  const style = typeof project.style === "string" ? project.style : "hien dai";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "You are a senior Vietnamese interior designer for a tile showroom.",
                "Analyze the uploaded bare room/current room and tile sample.",
                "Return only valid compact JSON with keys: wall, furniture, lighting, construction.",
                "Each value must be Vietnamese, practical, 1 short sentence.",
                "Advice must be specific to the actual room image, tile color/material and render mode.",
                "Furniture advice must strictly match the selected room type.",
                "If room type is bedroom, recommend bedroom furniture only: bed, bedside table, wardrobe, curtains, warm lighting; never recommend sofa, coffee table or TV console.",
                "If room type is living room, recommend living-room furniture only.",
                "Construction advice must mention keeping the tile size/aspect ratio, grain direction and grout pattern close to the uploaded tile sample.",
                mode === "full_design"
                  ? "The room may be unfinished: suggest furniture and decoration to complete it."
                  : "The room already has furniture: suggest subtle changes while keeping existing furniture.",
                `Room type: ${roomType}. Style: ${style}.`,
              ].join("\n"),
            },
            { type: "input_image", image_url: roomUrl, detail: "low" },
            { type: "input_image", image_url: tileUrl, detail: "low" },
          ],
        },
      ],
      text: { format: { type: "json_object" } },
    }),
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? "OpenAI advice generation failed.");

  let outputText = typeof payload?.output_text === "string" ? payload.output_text : "";
  if (!outputText && Array.isArray(payload?.output)) {
    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) continue;
      for (const content of item.content) {
        if (content?.type === "output_text" && typeof content.text === "string") {
          outputText = content.text;
          break;
        }
      }
      if (outputText) break;
    }
  }

  if (!outputText) return fallbackAdvice(project);
  try {
    return parseAdvicePayload(JSON.parse(outputText), project);
  } catch {
    return fallbackAdvice(project);
  }
}

async function fetchBlob(url: string, label: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Cannot fetch ${label} image: ${response.status} ${response.statusText}`);
  }
  return await response.blob();
}

async function callOpenAI(roomBlob: Blob, tileBlob: Blob, prompt: string, model: string) {
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", Deno.env.get("OPENAI_IMAGE_SIZE") ?? "1024x1024");
  form.append("quality", Deno.env.get("OPENAI_IMAGE_QUALITY") ?? "medium");
  form.append("n", "1");
  form.append("image[]", roomBlob, "room.png");
  form.append("image[]", tileBlob, "tile.png");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`,
    },
    body: form,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "OpenAI image generation failed.");
  }

  const first = payload?.data?.[0];
  if (first?.b64_json) return { b64: first.b64_json };
  if (first?.url) return { url: first.url };
  throw new Error("OpenAI did not return an image.");
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

    const result = await callOpenAI(roomBlob, tileBlob, buildPrompt(projectForGeneration), model);
    const adviceText = fallbackAdvice(projectForGeneration);
    let resultBytes: Uint8Array;

    if (result.b64) {
      resultBytes = base64ToBytes(result.b64);
    } else if (result.url) {
      const imageResponse = await fetch(result.url);
      if (!imageResponse.ok) throw new Error("Cannot download OpenAI result image.");
      resultBytes = new Uint8Array(await imageResponse.arrayBuffer());
    } else {
      throw new Error("No generated image returned.");
    }

    const path = `results/${userData.user.id}/${Date.now()}-${project.id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("duha-images")
      .upload(path, resultBytes, { contentType: "image/png", upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = supabase.storage.from("duha-images").getPublicUrl(path);
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update({
        result_image_url: publicUrl.publicUrl,
        advice_text: adviceText,
        generation_status: "succeeded",
        generation_error: null,
        ai_model: model,
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
