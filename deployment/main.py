import asyncio
import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sse_starlette.sse import EventSourceResponse

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

async def run_command_stream(command: str):
    """Executes a shell command and yields output line by line."""
    process = await asyncio.create_subprocess_shell(
        command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        shell=True
    )

    while True:
        line = await process.stdout.readline()
        if not line:
            break
        # Strip trailing whitespace/newlines and skip empty lines
        clean_line = line.decode("utf-8").strip()
        if clean_line:
            yield clean_line
    
    await process.wait()
    yield f"\n[Finished with exit code {process.returncode}]"

@app.get("/api/redeploy")
async def redeploy(request: Request):
    # Note: On Windows development machine, these commands might need adjustment
    # but I will keep them as requested for the target environment.
    command = "cd ~/wwwroot/api && cp .env.prod .env && docker compose up -d --build"
    
    async def event_generator():
        yield {"data": f"Starting deployment: {command}\n"}
        async for line in run_command_stream(command):
            # Check for client disconnect
            if await request.is_disconnected():
                break
            yield {"data": line}

    return EventSourceResponse(event_generator())

@app.get("/api/logs")
async def view_logs(request: Request):
    command = "cd ~/wwwroot/api && docker compose logs app -f --tail 100"
    
    async def event_generator():
        yield {"data": f"Streaming logs: {command}\n"}
        async for line in run_command_stream(command):
            if await request.is_disconnected():
                break
            yield {"data": line}

    return EventSourceResponse(event_generator())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="172.17.0.1", port=8000)
