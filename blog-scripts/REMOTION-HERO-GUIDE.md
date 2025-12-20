# Using Remotion for Anexee Hero Section

## What is Remotion?

Remotion creates **videos programmatically** using React. Instead of editing videos manually, you write code to generate animated video content.

## Use Cases for Anexee Hero Section

### 1. Animated Product Demo Background
Create a looping background video showing your platform in action:
- Dashboard animations
- Data flowing through systems
- Network connectivity visuals
- Industrial equipment monitoring

### 2. Dynamic Hero Video
Generate personalized hero videos:
- Different videos for different industries
- Time-based content (morning vs evening)
- Seasonal variations

### 3. Animated Explainer
Short animated sequences explaining:
- "Cloud + Edge + On-Premise" architecture
- How data flows through Anexee
- Key features in 10 seconds

---

## Setup for Anexee Project

### Option 1: Separate Remotion Project (Recommended)

Create videos separately, then embed in your website:

```bash
# Create new Remotion project
npx create-video@latest anexee-hero-videos

cd anexee-hero-videos

# Install dependencies
npm install
```

### Option 2: Integrate with Existing Project

Not recommended - keeps projects separate and simple.

---

## Example 1: Animated Data Flow Background

Create a looping background showing data flowing from devices to cloud.

**File: `src/DataFlow.tsx`**

```tsx
import {AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';

export const DataFlow: React.FC = () => {
    const frame = useCurrentFrame();
    const {width, height} = useVideoConfig();

    // Animate particles flowing upward
    const particleY = interpolate(
        frame,
        [0, 60],
        [height, 0],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'wrap', // Loop
        }
    );

    return (
        <AbsoluteFill style={{
            background: 'linear-gradient(180deg, #030305 0%, #0a0a0f 100%)'
        }}>
            {/* Flowing particles */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: `${i * 5}%`,
                        top: particleY + (i * 20),
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: '#00f2ea',
                        opacity: 0.6,
                    }}
                />
            ))}

            {/* Grid overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 242, 234, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 242, 234, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
            }} />
        </AbsoluteFill>
    );
};
```

**File: `src/Root.tsx`**

```tsx
import {Composition} from 'remotion';
import {DataFlow} from './DataFlow';

export const Root: React.FC = () => {
    return (
        <Composition
            id="DataFlow"
            component={DataFlow}
            durationInFrames={60} // 2 seconds at 30fps (loops seamlessly)
            width={1920}
            height={1080}
            fps={30}
        />
    );
};
```

---

## Example 2: Platform Feature Showcase

Animated sequence showing Anexee features.

**File: `src/FeatureShowcase.tsx`**

```tsx
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    Sequence,
    spring,
    useVideoConfig,
} from 'remotion';

const Feature: React.FC<{title: string; icon: string; delay: number}> = ({
    title,
    icon,
    delay,
}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();

    const scale = spring({
        fps,
        frame: frame - delay,
        config: {damping: 200},
    });

    const opacity = interpolate(
        frame - delay,
        [0, 10],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );

    return (
        <div
            style={{
                transform: `scale(${scale})`,
                opacity,
                background: 'rgba(0, 242, 234, 0.1)',
                border: '1px solid rgba(0, 242, 234, 0.3)',
                borderRadius: 16,
                padding: 40,
                textAlign: 'center',
                color: 'white',
            }}
        >
            <div style={{fontSize: 48, marginBottom: 20}}>{icon}</div>
            <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 24,
                margin: 0,
            }}>
                {title}
            </h3>
        </div>
    );
};

export const FeatureShowcase: React.FC = () => {
    return (
        <AbsoluteFill style={{
            background: '#030305',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: 100,
        }}>
            <Sequence from={0}>
                <Feature title="Cloud Native" icon="☁️" delay={0} />
            </Sequence>
            <Sequence from={0}>
                <Feature title="Edge Computing" icon="⚡" delay={15} />
            </Sequence>
            <Sequence from={0}>
                <Feature title="Real-Time Data" icon="📊" delay={30} />
            </Sequence>
        </AbsoluteFill>
    );
};
```

---

## Example 3: Animated Network Diagram

Show devices connecting to Anexee platform.

**File: `src/NetworkDiagram.tsx`**

```tsx
import {AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig} from 'remotion';

export const NetworkDiagram: React.FC = () => {
    const frame = useCurrentFrame();
    const {width, height} = useVideoConfig();

    const centerX = width / 2;
    const centerY = height / 2;

    // Animate connection lines growing
    const lineProgress = interpolate(
        frame,
        [0, 30],
        [0, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );

    // Pulse effect on center node
    const pulseScale = interpolate(
        frame % 30,
        [0, 15, 30],
        [1, 1.1, 1],
        {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
    );

    const devices = [
        {x: centerX - 300, y: centerY - 200, label: 'PLC'},
        {x: centerX + 300, y: centerY - 200, label: 'Sensor'},
        {x: centerX - 300, y: centerY + 200, label: 'HMI'},
        {x: centerX + 300, y: centerY + 200, label: 'Gateway'},
    ];

    return (
        <AbsoluteFill style={{background: '#030305'}}>
            <svg width={width} height={height}>
                {/* Connection lines */}
                {devices.map((device, i) => (
                    <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={centerX + (device.x - centerX) * lineProgress}
                        y2={centerY + (device.y - centerY) * lineProgress}
                        stroke="#00f2ea"
                        strokeWidth={2}
                        opacity={0.6}
                    />
                ))}

                {/* Center node (Anexee Platform) */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={60 * pulseScale}
                    fill="rgba(0, 242, 234, 0.2)"
                    stroke="#00f2ea"
                    strokeWidth={3}
                />
                <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={20}
                    fontFamily="Space Grotesk, sans-serif"
                >
                    ANEXEE
                </text>

                {/* Device nodes */}
                {devices.map((device, i) => (
                    <g
                        key={i}
                        opacity={interpolate(
                            frame,
                            [30 + i * 5, 40 + i * 5],
                            [0, 1],
                            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
                        )}
                    >
                        <circle
                            cx={device.x}
                            cy={device.y}
                            r={40}
                            fill="#030305"
                            stroke="#00f2ea"
                            strokeWidth={2}
                        />
                        <text
                            x={device.x}
                            y={device.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#00f2ea"
                            fontSize={14}
                            fontFamily="Space Grotesk, sans-serif"
                        >
                            {device.label}
                        </text>
                    </g>
                ))}
            </svg>
        </AbsoluteFill>
    );
};
```

---

## Rendering Videos

### Local Rendering

```bash
# Render video (MP4)
npx remotion render DataFlow data-flow.mp4

# Render as WebM (smaller file size for web)
npx remotion render DataFlow data-flow.webm

# Render transparent background (use PNG sequence)
npx remotion render DataFlow out/frame.png --sequence

# Render GIF (not recommended - use video)
npx remotion render DataFlow data-flow.gif
```

### Cloud Rendering (AWS Lambda)

For faster rendering of multiple videos:

```bash
# Setup (one-time)
npx remotion lambda setup

# Deploy function
npx remotion lambda functions deploy

# Deploy site
npx remotion lambda sites create src/index.ts

# Render on Lambda
npx remotion lambda render DataFlow
```

---

## Integrating Video into Hero Section

### Method 1: Background Video (Recommended)

```html
<!-- In your index.html hero section -->
<section class="hero">
    <video
        autoplay
        loop
        muted
        playsinline
        class="hero-video-bg"
    >
        <source src="videos/data-flow.webm" type="video/webm">
        <source src="videos/data-flow.mp4" type="video/mp4">
    </video>

    <div class="hero-content">
        <h1>Welcome to Anexee</h1>
        <!-- Your existing hero content -->
    </div>
</section>

<style>
.hero {
    position: relative;
    height: 100vh;
    overflow: hidden;
}

.hero-video-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    z-index: 0;
    opacity: 0.4; /* Subtle background */
}

.hero-content {
    position: relative;
    z-index: 1;
}
</style>
```

### Method 2: Canvas Element (For Interactive Videos)

```html
<canvas id="hero-canvas"></canvas>

<script src="https://unpkg.com/@remotion/player@4.0.0"></script>
<script>
    // Embed Remotion player
    const player = new Player({
        component: DataFlow,
        durationInFrames: 60,
        compositionWidth: 1920,
        compositionHeight: 1080,
        fps: 30,
    });

    player.render(document.getElementById('hero-canvas'));
</script>
```

---

## Best Practices for Hero Videos

### 1. Keep It Short & Looping
```tsx
// 2-4 seconds max, seamless loop
durationInFrames={90} // 3 seconds at 30fps
```

### 2. Optimize File Size
```bash
# Use WebM format (better compression)
npx remotion render DataFlow video.webm

# Or compress MP4
ffmpeg -i video.mp4 -vcodec libx264 -crf 28 video-compressed.mp4
```

### 3. Fallback for Mobile
```html
<video poster="hero-poster.jpg">
    <!-- Video sources -->
</video>
```

### 4. Preload Video
```html
<link rel="preload" as="video" href="data-flow.webm" type="video/webm">
```

---

## Workflow Summary

1. **Design** - Create Remotion components with animations
2. **Test** - Run `npm start` to preview in browser
3. **Render** - Generate video files using `npx remotion render`
4. **Optimize** - Compress videos for web
5. **Deploy** - Add to `public/videos/` folder
6. **Integrate** - Embed in hero section HTML

---

## Cost Comparison

| Method | Setup Time | Rendering Time | Cost |
|--------|-----------|----------------|------|
| Local | 30 min | 1-5 min/video | FREE |
| Lambda | 2 hours | 10-30 sec/video | ~$0.01-0.10/video |

For small projects (< 10 videos), use local rendering.

---

## Example: Complete Hero Video Project

```bash
# 1. Create project
npx create-video@latest anexee-hero

cd anexee-hero

# 2. Copy DataFlow.tsx to src/

# 3. Preview
npm start

# 4. Render
npx remotion render DataFlow public/data-flow.webm

# 5. Copy to Anexee project
cp out/data-flow.webm ../Anexee_Motion_Website/videos/

# 6. Update hero section in index.html
```

---

## When to Use Remotion vs Traditional Video

| Use Remotion | Use Traditional Video |
|--------------|----------------------|
| Animated graphics & data viz | Live footage, real people |
| Programmatic animations | Complex cinematography |
| Need to generate variants | One-time production |
| Regular content updates | Static evergreen content |

---

## Resources

- [Remotion Docs](https://www.remotion.dev/docs)
- [Example Gallery](https://www.remotion.dev/showcase)
- [Templates](https://www.remotion.dev/templates)

---

*Last updated: December 2025*
