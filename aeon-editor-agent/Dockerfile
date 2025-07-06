FROM nvidia/cuda:12.2.0-devel-ubuntu22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV CUDA_VISIBLE_DEVICES=0
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility,video

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    python3.11-distutils \
    python3-pip \
    build-essential \
    cmake \
    pkg-config \
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswscale-dev \
    libopencv-dev \
    libopencv-contrib-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libwebp-dev \
    libsndfile1-dev \
    libfftw3-dev \
    libasound2-dev \
    portaudio19-dev \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    curl \
    wget \
    git \
    unzip \
    htop \
    nano \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python package manager
RUN python3.11 -m pip install --upgrade pip setuptools wheel

# Create symbolic link for python
RUN ln -s /usr/bin/python3.11 /usr/bin/python

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install additional GPU-specific packages
RUN pip install --no-cache-dir \
    cupy-cuda12x \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121 \
    onnxruntime-gpu

# Install FFmpeg Python bindings
RUN pip install --no-cache-dir ffmpeg-python

# Create directories for assets and temp files
RUN mkdir -p /app/assets/fonts \
    && mkdir -p /app/assets/sfx \
    && mkdir -p /app/assets/overlays \
    && mkdir -p /tmp/aeon_temp \
    && chmod 777 /tmp/aeon_temp

# Copy application code
COPY app/ ./app/
COPY test/ ./test/

# Copy assets (fonts, SFX, etc.)
COPY assets/ ./assets/

# Set permissions
RUN chmod +x /app/app/main.py

# Create non-root user for security
RUN useradd -m -u 1000 aeon && \
    chown -R aeon:aeon /app && \
    chown -R aeon:aeon /tmp/aeon_temp

# Switch to non-root user
USER aeon

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Environment variables for production
ENV PYTHONPATH=/app
ENV CUDA_CACHE_PATH=/tmp/cuda_cache
ENV NUMBA_CACHE_DIR=/tmp/numba_cache
ENV MOVIEPY_TEMP_DIR=/tmp/moviepy_temp

# Create cache directories
RUN mkdir -p /tmp/cuda_cache /tmp/numba_cache /tmp/moviepy_temp

# GPU memory optimization
ENV CUDA_MEMORY_FRACTION=0.8
ENV PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512

# Performance tuning
ENV OMP_NUM_THREADS=4
ENV MKL_NUM_THREADS=4
ENV NUMBA_NUM_THREADS=4

# Logging configuration
ENV LOG_LEVEL=INFO
ENV LOG_FORMAT=json

# FastAPI configuration
ENV FASTAPI_ENV=production
ENV FASTAPI_DEBUG=false

# Start command
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1", "--loop", "uvloop"]
