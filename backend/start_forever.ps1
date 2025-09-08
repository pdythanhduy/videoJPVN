# PowerShell script để khởi động backend ổn định
param(
    [switch]$Force
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Backend Auto Manager" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

# Function để kill process trên port 8000
function Stop-BackendProcesses {
    Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Yellow
    
    try {
        $processes = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | 
                    Select-Object -ExpandProperty OwningProcess | 
                    Get-Process -ErrorAction SilentlyContinue
        
        foreach ($proc in $processes) {
            if ($proc.ProcessName -eq "python") {
                Write-Host "Killing process: $($proc.Id) - $($proc.ProcessName)" -ForegroundColor Red
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
        }
        
        Start-Sleep -Seconds 2
        Write-Host "✅ Processes stopped" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Error stopping processes: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Function để kiểm tra port
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function để khởi động backend
function Start-Backend {
    Write-Host "🚀 Starting backend..." -ForegroundColor Green
    
    try {
        # Kill existing processes
        Stop-BackendProcesses
        
        # Đợi port được giải phóng
        $timeout = 10
        $count = 0
        while ((Test-Port 8000) -and ($count -lt $timeout)) {
            Write-Host "Waiting for port 8000 to be available... ($count/$timeout)" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
            $count++
        }
        
        # Khởi động backend
        $process = Start-Process -FilePath "python" -ArgumentList "main_simple.py" -PassThru -WindowStyle Hidden
        
        # Đợi backend khởi động
        $timeout = 30
        $count = 0
        while (-not (Test-Port 8000) -and ($count -lt $timeout)) {
            Write-Host "Waiting for backend to start... ($count/$timeout)" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
            $count++
        }
        
        if (Test-Port 8000) {
            Write-Host "✅ Backend started successfully!" -ForegroundColor Green
            Write-Host "🌐 URL: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "📚 API docs: http://localhost:8000/docs" -ForegroundColor Cyan
            return $process
        } else {
            Write-Host "❌ Backend failed to start" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "❌ Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function để giám sát backend
function Monitor-Backend {
    param($Process)
    
    Write-Host "👁️  Monitoring backend..." -ForegroundColor Green
    Write-Host "⏹️  Press Ctrl+C to stop" -ForegroundColor Yellow
    
    $restartCount = 0
    $maxRestarts = 10
    
    while ($true) {
        try {
            # Kiểm tra process
            if ($Process -and $Process.HasExited) {
                Write-Host "⚠️  Backend process died, restarting..." -ForegroundColor Yellow
                
                if ($restartCount -ge $maxRestarts) {
                    Write-Host "❌ Max restarts reached ($maxRestarts). Stopping." -ForegroundColor Red
                    break
                }
                
                $restartCount++
                Write-Host "🔄 Restart attempt $restartCount/$maxRestarts" -ForegroundColor Yellow
                
                $Process = Start-Backend
                if ($Process) {
                    $restartCount = 0
                    Write-Host "✅ Backend restarted successfully" -ForegroundColor Green
                } else {
                    Write-Host "❌ Failed to restart backend" -ForegroundColor Red
                    Start-Sleep -Seconds 10
                }
            }
            
            # Kiểm tra health
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -ErrorAction Stop
                if ($response.StatusCode -ne 200) {
                    Write-Host "⚠️  Health check failed" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "⚠️  Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
            Start-Sleep -Seconds 30
        }
        catch {
            Write-Host "❌ Error in monitoring: $($_.Exception.Message)" -ForegroundColor Red
            Start-Sleep -Seconds 5
        }
    }
}

# Main execution
try {
    # Khởi động backend
    $backendProcess = Start-Backend
    
    if ($backendProcess) {
        # Bắt đầu giám sát
        Monitor-Backend -Process $backendProcess
    } else {
        Write-Host "❌ Cannot start backend" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Fatal error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Write-Host "🛑 Stopping backend..." -ForegroundColor Yellow
    Stop-BackendProcesses
    Write-Host "✅ Backend stopped" -ForegroundColor Green
}
