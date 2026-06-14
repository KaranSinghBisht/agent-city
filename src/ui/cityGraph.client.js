/**
 * Agent City — React Flow city graph (build-free ESM island).
 *
 * Loaded from /city-graph.js as a module; pulls React + @xyflow/react from a CDN
 * so the app stays bundler-free. Mounts into #rf-root (which holds an inline SVG
 * fallback that survives if this module or the CDN ever fails to load). Syncs to
 * the live run via the window 'cityrun' CustomEvent dispatched by the page poll.
 */
import React, { useEffect } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "https://esm.sh/@xyflow/react@12?deps=react@18.3.1,react-dom@18.3.1";
import htm from "https://esm.sh/htm@3";

const html = htm.bind(React.createElement);

const BORDER = { idle: "#2A5080", active: "#5098DC", settled: "#E05C1A", blocked: "#D44040" };

/** A Blueprint-Civic node: title bar + label, status-driven border + glow. */
function CityNode({ data }) {
  const status = data.status || "idle";
  const border = BORDER[status] || BORDER.idle;
  return html`<div style=${{
    width: data.w || 156,
    background: "#0F2540",
    border: "1.5px solid " + border,
    color: "#C8D8F0",
    fontFamily: '"Barlow Condensed","Arial Narrow",sans-serif',
    boxShadow: status === "settled" ? "0 0 16px rgba(224,92,26,.5)" : "none",
    transition: "border-color .3s, box-shadow .3s",
  }}>
    ${data.top !== false &&
    html`<${Handle} type="target" position=${Position.Top} style=${{ opacity: 0 }} />`}
    <div style=${{
      background: "#132B4A",
      padding: "3px 9px",
      fontFamily: '"JetBrains Mono",monospace',
      fontSize: 8,
      letterSpacing: ".09em",
      color: data.accent || "#7A9BC4",
      textTransform: "uppercase",
    }}>${data.tag}</div>
    <div style=${{ padding: "8px 9px", textAlign: "center" }}>
      <div style=${{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: ".04em" }}>${data.title}</div>
      ${data.sub &&
      html`<div style=${{ fontFamily: '"JetBrains Mono",monospace', fontSize: 8.5, color: "#7A9BC4", marginTop: 3 }}>${data.sub}</div>`}
    </div>
    ${data.bottom !== false &&
    html`<${Handle} type="source" position=${Position.Bottom} style=${{ opacity: 0 }} />`}
  </div>`;
}

const nodeTypes = { city: CityNode };

const INITIAL_NODES = [
  { id: "mayor", type: "city", position: { x: 232, y: 0 }, data: { tag: "Mayor · Treasury", title: "Your Budget", sub: "ERC-7715 ≤ 5 USDC", accent: "#E05C1A", top: false } },
  { id: "manager", type: "city", position: { x: 232, y: 116 }, data: { tag: "Manager", title: "Re-delegates", sub: "A2A · ERC-7710" } },
  { id: "w0", type: "city", position: { x: 36, y: 236 }, data: { tag: "Research Agent", title: "Research", sub: "x402 · capped" } },
  { id: "w1", type: "city", position: { x: 428, y: 236 }, data: { tag: "Analyst Agent", title: "Analyst", sub: "x402 · capped" } },
  { id: "svc0", type: "city", position: { x: 36, y: 356 }, data: { tag: "x402 Service", title: "Market-Data", sub: "pay-per-call", bottom: false } },
  { id: "svc1", type: "city", position: { x: 428, y: 356 }, data: { tag: "x402 Service", title: "Sentiment", sub: "pay-per-call", bottom: false } },
];

const edge = (id, source, target) => ({
  id,
  source,
  target,
  animated: false,
  style: { stroke: "#2A5080", strokeWidth: 1.4 },
});
const INITIAL_EDGES = [
  edge("e-mm", "mayor", "manager"),
  edge("e-m0", "manager", "w0"),
  edge("e-m1", "manager", "w1"),
  edge("e-p0", "w0", "svc0"),
  edge("e-p1", "w1", "svc1"),
];

const ACTIVE_EDGE = { stroke: "#E05C1A", strokeWidth: 1.8 };
const IDLE_EDGE = { stroke: "#2A5080", strokeWidth: 1.4 };

/** Map a worker's run status to node/edge state for this index (0 or 1). */
function applyRun(run, nodes, edges) {
  const status = {}; // nodeId -> status
  const flow = {}; // edgeId -> bool
  const led = (run && run.ledger) || [];
  if (led.length) {
    flow["e-mm"] = true;
    status["mayor"] = "settled";
    status["manager"] = "active";
  }
  led.slice(0, 2).forEach((e, i) => {
    const st = e.status;
    const wId = "w" + i, svcId = "svc" + i, dEdge = "e-m" + i, pEdge = "e-p" + i;
    if (st === "hiring") { status[wId] = "active"; flow[dEdge] = true; }
    else if (st === "paying") { status[wId] = "active"; flow[dEdge] = true; flow[pEdge] = true; }
    else if (st === "settled") { status[wId] = "settled"; status[svcId] = "settled"; }
    else if (st === "blocked" || st === "failed") { status[wId] = "blocked"; }
  });
  if (run && (run.status === "done" || run.status === "failed")) {
    Object.keys(flow).forEach((k) => (flow[k] = false));
  }
  const revoked = run && run.revoked;
  const nextNodes = nodes.map((n) => ({
    ...n,
    data: { ...n.data, status: revoked ? "blocked" : status[n.id] || (n.id === "mayor" && led.length ? "settled" : "idle") },
  }));
  const nextEdges = edges.map((e) => ({
    ...e,
    animated: !revoked && !!flow[e.id],
    style: !revoked && flow[e.id] ? ACTIVE_EDGE : IDLE_EDGE,
  }));
  return { nextNodes, nextEdges };
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  useEffect(() => {
    function onRun(ev) {
      setNodes((ns) => {
        let out = ns;
        setEdges((es) => {
          const { nextNodes, nextEdges } = applyRun(ev.detail, ns, es);
          out = nextNodes;
          return nextEdges;
        });
        return out;
      });
    }
    window.addEventListener("cityrun", onRun);
    return () => window.removeEventListener("cityrun", onRun);
  }, [setNodes, setEdges]);

  return html`<${ReactFlow}
    nodes=${nodes}
    edges=${edges}
    nodeTypes=${nodeTypes}
    onNodesChange=${onNodesChange}
    onEdgesChange=${onEdgesChange}
    fitView
    fitViewOptions=${{ padding: 0.18 }}
    proOptions=${{ hideAttribution: true }}
    minZoom=${0.4}
    maxZoom=${1.6}
  >
    <${Background} color="#1B3A5E" gap=${22} size=${1} />
    <${Controls} showInteractive=${false} />
  </${ReactFlow}>`;
}

const root = document.getElementById("rf-root");
if (root) {
  root.innerHTML = ""; // clear the SVG fallback once React is ready to mount
  root.style.height = "440px";
  createRoot(root).render(html`<${App} />`);
}
