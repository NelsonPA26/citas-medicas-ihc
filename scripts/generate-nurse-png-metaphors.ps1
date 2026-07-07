Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..\src\public\img\action-metaphors'

$colors = @{
  Ink = [System.Drawing.Color]::FromArgb(8, 48, 91)
  Hair = [System.Drawing.Color]::FromArgb(63, 45, 35)
  HairDark = [System.Drawing.Color]::FromArgb(39, 28, 24)
  SkinTop = [System.Drawing.Color]::FromArgb(255, 215, 171)
  SkinBottom = [System.Drawing.Color]::FromArgb(255, 177, 111)
  ScrubTop = [System.Drawing.Color]::FromArgb(82, 215, 209)
  ScrubBottom = [System.Drawing.Color]::FromArgb(26, 166, 161)
  White = [System.Drawing.Color]::White
  Blue = [System.Drawing.Color]::FromArgb(13, 110, 253)
  Green = [System.Drawing.Color]::FromArgb(25, 166, 90)
  Teal = [System.Drawing.Color]::FromArgb(20, 184, 166)
  Orange = [System.Drawing.Color]::FromArgb(245, 158, 11)
  Red = [System.Drawing.Color]::FromArgb(239, 68, 68)
  Gray = [System.Drawing.Color]::FromArgb(100, 116, 139)
  Violet = [System.Drawing.Color]::FromArgb(99, 102, 241)
}

function New-Pen($color, $width) {
  $pen = New-Object System.Drawing.Pen($color, $width)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  return $pen
}

function New-Brush($color) {
  return New-Object System.Drawing.SolidBrush($color)
}

function Add-PathPoint($path, [float[]]$points) {
  $path.StartFigure()
  $path.AddLines(@(
    (New-Object System.Drawing.PointF($points[0], $points[1])),
    (New-Object System.Drawing.PointF($points[2], $points[3])),
    (New-Object System.Drawing.PointF($points[4], $points[5]))
  ))
  $path.CloseFigure()
}

function Draw-NurseObject($g) {
  $inkPen = New-Pen $colors.Ink 7
  $thinInk = New-Pen $colors.Ink 5

  $hairBrush = New-Brush $colors.Hair
  $hairDarkBrush = New-Brush $colors.HairDark
  $whiteBrush = New-Brush $colors.White

  $g.FillEllipse($hairDarkBrush, 151, 108, 70, 72)
  $g.DrawEllipse($thinInk, 151, 108, 70, 72)
  $g.FillPie($hairBrush, 73, 50, 108, 125, 165, 230)
  $g.DrawArc($inkPen, 73, 50, 108, 125, 165, 230)

  $cap = New-Object System.Drawing.Drawing2D.GraphicsPath
  $cap.AddBezier(78, 38, 105, 10, 156, 10, 184, 38)
  $cap.AddLine(184, 38, 176, 74)
  $cap.AddBezier(176, 74, 141, 58, 112, 58, 80, 74)
  $cap.CloseFigure()
  $g.FillPath($whiteBrush, $cap)
  $g.DrawPath($inkPen, $cap)

  $crossPen = New-Pen $colors.Teal 10
  $g.DrawLine($crossPen, 132, 31, 132, 55)
  $g.DrawLine($crossPen, 120, 43, 144, 43)

  $skinRect = New-Object System.Drawing.Rectangle(84, 78, 96, 103)
  $skinBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($skinRect, $colors.SkinTop, $colors.SkinBottom, 90)
  $g.FillEllipse((New-Brush $colors.SkinTop), 78, 96, 28, 36)
  $g.FillEllipse((New-Brush $colors.SkinTop), 168, 96, 28, 36)
  $g.DrawEllipse($thinInk, 78, 96, 28, 36)
  $g.DrawEllipse($thinInk, 168, 96, 28, 36)
  $g.FillEllipse($skinBrush, $skinRect)
  $g.DrawEllipse($inkPen, $skinRect)

  $hairLine = New-Object System.Drawing.Drawing2D.GraphicsPath
  $hairLine.AddBezier(84, 91, 114, 82, 139, 61, 151, 42)
  $hairLine.AddBezier(151, 42, 162, 74, 179, 86, 190, 93)
  $g.DrawPath($inkPen, $hairLine)

  $scrubPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $scrubPath.AddBezier(42, 232, 45, 180, 68, 151, 111, 144)
  $scrubPath.AddLine(111, 144, 128, 186)
  $scrubPath.AddLine(128, 186, 146, 144)
  $scrubPath.AddBezier(146, 144, 188, 151, 211, 180, 214, 232)
  $scrubPath.AddLine(214, 232, 42, 232)
  $scrubPath.CloseFigure()
  $scrubBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush((New-Object System.Drawing.Rectangle(42, 144, 172, 88)), $colors.ScrubTop, $colors.ScrubBottom, 90)
  $g.FillPath($scrubBrush, $scrubPath)
  $g.DrawPath($inkPen, $scrubPath)

  $neck = New-Object System.Drawing.Drawing2D.GraphicsPath
  $neck.AddLine(111, 144, 128, 186)
  $neck.AddLine(128, 186, 146, 144)
  $g.DrawPath($inkPen, $neck)

  $badgePen = New-Pen $colors.Ink 4
  $g.FillRectangle($whiteBrush, 157, 189, 35, 18)
  $g.DrawRectangle($badgePen, 157, 189, 35, 18)
}

function Draw-Overlay($g, $action) {
  $overlayColor = switch ($action) {
    'registrar' { $colors.Green }
    'activar' { $colors.Green }
    'desactivar' { $colors.Gray }
    'buscar' { $colors.Blue }
    'ver' { $colors.Blue }
    'filtrar' { $colors.Orange }
    'limpiar' { $colors.Gray }
    'editar' { $colors.Orange }
    'cancelar' { $colors.Red }
    'eliminar' { $colors.Red }
    'guardar' { $colors.Green }
    'confirmar' { $colors.Green }
    'seguridad' { $colors.Violet }
    default { $colors.Blue }
  }

  $whitePen = New-Pen $colors.White 7
  $symbolPen = New-Pen $colors.White 8
  $brush = New-Brush $overlayColor

  $g.FillEllipse($brush, 184, 184, 58, 58)
  $g.DrawEllipse($whitePen, 184, 184, 58, 58)

  switch ($action) {
    { $_ -in @('registrar') } {
      $g.DrawLine($symbolPen, 213, 198, 213, 228)
      $g.DrawLine($symbolPen, 198, 213, 228, 213)
    }
    { $_ -in @('buscar', 'ver') } {
      $g.DrawEllipse($symbolPen, 200, 200, 19, 19)
      $g.DrawLine($symbolPen, 217, 217, 230, 230)
    }
    'filtrar' {
      $filter = New-Object System.Drawing.Drawing2D.GraphicsPath
      $filter.AddLine(195, 199, 231, 199)
      $filter.AddLine(231, 199, 218, 214)
      $filter.AddLine(218, 214, 218, 228)
      $filter.AddLine(218, 228, 208, 232)
      $filter.AddLine(208, 232, 208, 214)
      $filter.CloseFigure()
      $g.FillPath((New-Brush $colors.White), $filter)
    }
    'limpiar' {
      $g.DrawLine($symbolPen, 199, 226, 226, 199)
      $g.DrawLine($symbolPen, 200, 231, 230, 231)
    }
    'editar' {
      $g.DrawLine($symbolPen, 199, 226, 225, 200)
      $g.DrawLine($symbolPen, 218, 198, 228, 208)
      $g.DrawLine($symbolPen, 196, 229, 207, 226)
    }
    'cancelar' {
      $g.DrawLine($symbolPen, 201, 201, 227, 227)
      $g.DrawLine($symbolPen, 227, 201, 201, 227)
    }
    'eliminar' {
      $g.DrawLine($symbolPen, 199, 204, 228, 204)
      $g.DrawRectangle($symbolPen, 204, 207, 19, 24)
      $g.DrawLine($symbolPen, 208, 199, 220, 199)
    }
    { $_ -in @('guardar', 'confirmar') } {
      $g.DrawLine($symbolPen, 199, 214, 210, 225)
      $g.DrawLine($symbolPen, 210, 225, 229, 201)
    }
    { $_ -in @('activar', 'desactivar') } {
      $g.DrawLine($symbolPen, 213, 198, 213, 215)
      $g.DrawArc($symbolPen, 200, 205, 27, 27, 135, 270)
    }
    'seguridad' {
      $g.DrawRectangle($symbolPen, 199, 211, 28, 20)
      $g.DrawArc($symbolPen, 204, 197, 18, 22, 180, 180)
    }
  }
}

function Save-NurseAction($relativeFolder, $action) {
  $folder = Join-Path $root $relativeFolder
  New-Item -ItemType Directory -Path $folder -Force | Out-Null
  $output = Join-Path $folder "$action.png"

  $bitmap = New-Object System.Drawing.Bitmap(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  Draw-NurseObject $graphics
  Draw-Overlay $graphics $action

  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$adminActions = @('registrar', 'limpiar', 'filtrar', 'editar', 'activar', 'desactivar', 'eliminar', 'cancelar', 'guardar', 'confirmar')
$profileActions = @('guardar', 'cancelar', 'seguridad')

foreach ($action in $adminActions) {
  Save-NurseAction 'administrador\enfermeras' $action
}

foreach ($action in $profileActions) {
  Save-NurseAction 'enfermera\perfil' $action
}

Write-Output 'Nurse PNG action metaphors generated.'
