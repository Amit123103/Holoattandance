import psutil
import time
import os
from datetime import datetime

class SystemMonitor:
    def get_system_stats(self):
        """
        Returns snapshot of current system resources.
        """
        # CPU
        cpu_percent = psutil.cpu_percent(interval=0.1)
        
        # Memory
        mem = psutil.virtual_memory()
        ram_percent = mem.percent
        ram_total_gb = round(mem.total / (1024**3), 2)
        ram_used_gb = round(mem.used / (1024**3), 2)
        
        # Disk
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        disk_total_gb = round(disk.total / (1024**3), 2)
        disk_free_gb = round(disk.free / (1024**3), 2)
        
        # Uptime
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.now() - boot_time
        uptime_str = str(uptime).split('.')[0] # Remove microseconds
        
        return {
            "cpu_usage": cpu_percent,
            "ram_usage": ram_percent,
            "ram_details": f"{ram_used_gb}GB / {ram_total_gb}GB",
            "disk_usage": disk_percent,
            "disk_details": f"{disk_free_gb}GB Free / {disk_total_gb}GB Total",
            "uptime": uptime_str,
            "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
