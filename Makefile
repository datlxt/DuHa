.PHONY: install dev dev-docker build preview typecheck check-env db-push functions-deploy deploy clean

# --- Local development (host Node) ---------------------------------------------
install:            ## Install frontend dependencies
	npm --prefix frontend ci

dev:               ## Run the Vite dev server on the host (hot reload)
	npm --prefix frontend run dev

check-env:         ## Validate that Supabase env vars are set
	npm --prefix frontend run check:env

typecheck:         ## Type-check the frontend
	npm --prefix frontend run typecheck

build:             ## Production build (outputs frontend/dist)
	npm --prefix frontend run build

preview:           ## Serve the production build locally
	npm --prefix frontend run preview

# --- Local development (Docker) ------------------------------------------------
dev-docker:        ## Run the dev server in Docker (reads root .env)
	docker compose up --build

down:              ## Stop the Docker dev stack
	docker compose down

# --- Backend (Supabase managed) ------------------------------------------------
db-push:           ## Apply supabase/migrations to the linked Supabase project
	supabase db push

functions-deploy:  ## Deploy the AI Edge Function to Supabase
	supabase functions deploy generate-visualization

# --- Deploy --------------------------------------------------------------------
deploy:            ## Deploy the frontend to Vercel (production)
	vercel --prod

clean:             ## Remove build artifacts
	rm -rf frontend/dist frontend/*.tsbuildinfo
