"""
AEON Performance Monitoring Module
GPU monitoring, metrics collection, and performance optimization
"""

import logging
import time
import psutil
import threading
from typing import Dict, Any, Optional, Tuple
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest

logger = logging.getLogger(__name__)

# GPU monitoring imports
try:
    import GPUtil
    import py3nvml.py3nvml as nvml
    nvml.nvmlInit()
    GPU_MONITORING_AVAILABLE = True
    logger.info("🚀 GPU monitoring available")
except (ImportError, Exception) as e:
    GPU_MONITORING_AVAILABLE = False
    GPUtil = None
    nvml = None
    logger.warning(f"⚠️ GPU monitoring not available: {e}")

# Prometheus metrics
registry = CollectorRegistry()

# Request metrics
REQUEST_COUNT = Counter('aeon_requests_total', 'Total requests', ['method', 'endpoint', 'status'], registry=registry)
REQUEST_DURATION = Histogram('aeon_request_duration_seconds', 'Request duration', ['endpoint'], registry=registry)
PROCESSING_JOBS = Counter('aeon_processing_jobs_total', 'Total processing jobs', ['status'], registry=registry)

# System metrics
CPU_USAGE = Gauge('aeon_cpu_usage_percent', 'CPU usage percentage', registry=registry)
MEMORY_USAGE = Gauge('aeon_memory_usage_percent', 'Memory usage percentage', registry=registry)
DISK_USAGE = Gauge('aeon_disk_usage_percent', 'Disk usage percentage', registry=registry)

# GPU metrics
GPU_USAGE = Gauge('aeon_gpu_usage_percent', 'GPU usage percentage', ['gpu_id'], registry=registry)
GPU_MEMORY_USAGE = Gauge('aeon_gpu_memory_usage_percent', 'GPU memory usage percentage', ['gpu_id'], registry=registry)
GPU_TEMPERATURE = Gauge('aeon_gpu_temperature_celsius', 'GPU temperature in Celsius', ['gpu_id'], registry=registry)

# Video processing metrics
VIDEO_PROCESSING_TIME = Histogram('aeon_video_processing_seconds', 'Video processing time', ['quality', 'transition_type'], registry=registry)
VIRAL_SCORE = Histogram('aeon_viral_score', 'Viral score distribution', registry=registry)
FRAME_PROCESSING_RATE = Gauge('aeon_frame_processing_rate_fps', 'Frame processing rate in FPS', registry=registry)

# Error metrics
ERROR_COUNT = Counter('aeon_errors_total', 'Total errors', ['error_type', 'component'], registry=registry)


class PerformanceMonitor:
    """
    Performance monitoring and metrics collection
    """
    
    def __init__(self):
        self.monitoring_active = False
        self.monitoring_thread = None
        self.metrics_data = {}
        
    def start_monitoring(self, interval: float = 10.0):
        """Start background monitoring"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(
            target=self._monitoring_loop,
            args=(interval,),
            daemon=True
        )
        self.monitoring_thread.start()
        logger.info(f"📊 Performance monitoring started (interval: {interval}s)")
    
    def stop_monitoring(self):
        """Stop background monitoring"""
        self.monitoring_active = False
        if self.monitoring_thread:
            self.monitoring_thread.join(timeout=5.0)
        logger.info("📊 Performance monitoring stopped")
    
    def _monitoring_loop(self, interval: float):
        """Background monitoring loop"""
        while self.monitoring_active:
            try:
                self._collect_system_metrics()
                self._collect_gpu_metrics()
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                time.sleep(interval)
    
    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            CPU_USAGE.set(cpu_percent)
            
            # Memory usage
            memory = psutil.virtual_memory()
            MEMORY_USAGE.set(memory.percent)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            DISK_USAGE.set(disk.percent)
            
            # Store in metrics data
            self.metrics_data.update({
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'timestamp': time.time()
            })
            
        except Exception as e:
            logger.warning(f"System metrics collection failed: {e}")
    
    def _collect_gpu_metrics(self):
        """Collect GPU performance metrics"""
        if not GPU_MONITORING_AVAILABLE:
            return
        
        try:
            gpus = GPUtil.getGPUs()
            for i, gpu in enumerate(gpus):
                GPU_USAGE.labels(gpu_id=str(i)).set(gpu.load * 100)
                GPU_MEMORY_USAGE.labels(gpu_id=str(i)).set(gpu.memoryUtil * 100)
                GPU_TEMPERATURE.labels(gpu_id=str(i)).set(gpu.temperature)
                
                # Store in metrics data
                self.metrics_data[f'gpu_{i}'] = {
                    'usage_percent': gpu.load * 100,
                    'memory_percent': gpu.memoryUtil * 100,
                    'temperature': gpu.temperature,
                    'memory_free': gpu.memoryFree,
                    'memory_total': gpu.memoryTotal
                }
                
        except Exception as e:
            logger.warning(f"GPU metrics collection failed: {e}")
    
    def get_current_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        return self.metrics_data.copy()
    
    def get_prometheus_metrics(self) -> str:
        """Get Prometheus formatted metrics"""
        return generate_latest(registry)


class VideoProcessingProfiler:
    """
    Profiler for video processing operations
    """
    
    def __init__(self):
        self.active_profiles = {}
    
    def start_profile(self, job_id: str, operation: str, metadata: Dict[str, Any] = None):
        """Start profiling a video processing operation"""
        self.active_profiles[job_id] = {
            'operation': operation,
            'start_time': time.time(),
            'metadata': metadata or {},
            'checkpoints': []
        }
        logger.debug(f"📊 Started profiling {operation} for job {job_id}")
    
    def add_checkpoint(self, job_id: str, checkpoint_name: str):
        """Add a checkpoint to the profile"""
        if job_id in self.active_profiles:
            checkpoint_time = time.time()
            self.active_profiles[job_id]['checkpoints'].append({
                'name': checkpoint_name,
                'time': checkpoint_time,
                'elapsed': checkpoint_time - self.active_profiles[job_id]['start_time']
            })
            logger.debug(f"📊 Checkpoint '{checkpoint_name}' for job {job_id}")
    
    def end_profile(self, job_id: str, success: bool = True, viral_score: float = None):
        """End profiling and record metrics"""
        if job_id not in self.active_profiles:
            return
        
        profile = self.active_profiles.pop(job_id)
        end_time = time.time()
        total_duration = end_time - profile['start_time']
        
        # Record Prometheus metrics
        operation = profile['operation']
        quality = profile['metadata'].get('quality', 'unknown')
        transition_type = profile['metadata'].get('transition_type', 'unknown')
        
        VIDEO_PROCESSING_TIME.labels(quality=quality, transition_type=transition_type).observe(total_duration)
        
        if viral_score is not None:
            VIRAL_SCORE.observe(viral_score)
        
        PROCESSING_JOBS.labels(status='completed' if success else 'failed').inc()
        
        logger.info(f"📊 Profile completed for {operation}: {total_duration:.2f}s, success: {success}")
        
        return {
            'operation': operation,
            'duration': total_duration,
            'success': success,
            'viral_score': viral_score,
            'checkpoints': profile['checkpoints'],
            'metadata': profile['metadata']
        }


class GPUMemoryManager:
    """
    GPU memory management and optimization
    """
    
    def __init__(self):
        self.memory_threshold = 0.9  # 90% memory usage threshold
        
    def check_gpu_memory(self) -> Dict[str, Any]:
        """Check GPU memory status"""
        if not GPU_MONITORING_AVAILABLE:
            return {'available': False}
        
        try:
            gpus = GPUtil.getGPUs()
            if not gpus:
                return {'available': False}
            
            gpu = gpus[0]  # Use first GPU
            memory_usage = gpu.memoryUtil
            
            return {
                'available': True,
                'memory_usage': memory_usage,
                'memory_free': gpu.memoryFree,
                'memory_total': gpu.memoryTotal,
                'memory_used': gpu.memoryUsed,
                'can_allocate': memory_usage < self.memory_threshold
            }
            
        except Exception as e:
            logger.warning(f"GPU memory check failed: {e}")
            return {'available': False, 'error': str(e)}
    
    def optimize_for_processing(self, video_size: Tuple[int, int], quality: str) -> Dict[str, Any]:
        """Optimize GPU settings for video processing"""
        memory_status = self.check_gpu_memory()
        
        if not memory_status['available']:
            return {'use_gpu': False, 'reason': 'GPU not available'}
        
        # Calculate memory requirements
        width, height = video_size
        pixels = width * height
        
        # Estimate memory usage (rough calculation)
        if quality == 'ultra':
            memory_multiplier = 4.0
        elif quality == 'high':
            memory_multiplier = 2.0
        elif quality == 'medium':
            memory_multiplier = 1.0
        else:
            memory_multiplier = 0.5
        
        estimated_memory_mb = (pixels * memory_multiplier) / (1024 * 1024)
        
        if estimated_memory_mb > memory_status['memory_free']:
            return {
                'use_gpu': False,
                'reason': f'Insufficient GPU memory: need {estimated_memory_mb:.0f}MB, have {memory_status["memory_free"]:.0f}MB'
            }
        
        return {
            'use_gpu': True,
            'estimated_memory_mb': estimated_memory_mb,
            'available_memory_mb': memory_status['memory_free']
        }


# Global instances
performance_monitor = PerformanceMonitor()
video_profiler = VideoProcessingProfiler()
gpu_memory_manager = GPUMemoryManager()


def record_error(error_type: str, component: str, error: Exception):
    """Record an error in metrics"""
    ERROR_COUNT.labels(error_type=error_type, component=component).inc()
    logger.error(f"Error in {component} ({error_type}): {error}")


def get_system_health() -> Dict[str, Any]:
    """Get comprehensive system health status"""
    health = {
        'status': 'healthy',
        'timestamp': time.time(),
        'system': {},
        'gpu': {},
        'services': {}
    }
    
    try:
        # System metrics
        health['system'] = {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'load_average': psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
        }
        
        # GPU metrics
        if GPU_MONITORING_AVAILABLE:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]
                health['gpu'] = {
                    'available': True,
                    'usage_percent': gpu.load * 100,
                    'memory_percent': gpu.memoryUtil * 100,
                    'temperature': gpu.temperature,
                    'memory_free_mb': gpu.memoryFree
                }
            else:
                health['gpu'] = {'available': False, 'reason': 'No GPUs found'}
        else:
            health['gpu'] = {'available': False, 'reason': 'GPU monitoring not available'}
        
        # Check for critical issues
        if health['system']['cpu_percent'] > 90:
            health['status'] = 'warning'
        if health['system']['memory_percent'] > 90:
            health['status'] = 'critical'
        if health['system']['disk_percent'] > 95:
            health['status'] = 'critical'
        
    except Exception as e:
        health['status'] = 'error'
        health['error'] = str(e)
    
    return health
