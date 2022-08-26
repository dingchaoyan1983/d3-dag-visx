import React, { useEffect, useState } from "react";
import * as d3Dag from "d3-dag";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { LinkHorizontal } from "@visx/shape";
import data from "./data";
import { Zoom } from "@visx/zoom";
import { localPoint } from "@visx/event";

const peach = "#fd9b93";
const pink = "#fe6e9e";
const blue = "#03c0dc";
const green = "#26deb0";
const lightpurple = "#374469";
export const background = "#272b4d";
const margin = { top: 10, left: 80, right: 80, bottom: 10 };

function CustomLink({ link }) {
  return (
    <line
      x1={link.source.x}
      y1={link.source.y + 20}
      x2={link.target.x}
      y2={link.target.y - 20}
      strokeWidth={2}
      stroke="#999"
      transform="rotate(90) scale(1, -1)"
      strokeOpacity={0.6}
      markerEnd="url(#arrow)"
    />
  );
}

const nodeWidth = 40;
const nodeHeight = 20;
const initialTransform = {
  scaleX: 1.27,
  scaleY: 1.27,
  translateX: -211.62,
  translateY: 162.59,
  skewX: 0,
  skewY: 0
};
const ExampleDag = ({ width, height }) => {
  const [dag, setDag] = useState<any | null>(null);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  useEffect(() => {
    const dag = d3Dag.dagStratify()(data);
    const nodeRadius = 22; //need to change based on the nodeWidth value
    const layout = d3Dag
      .sugiyama() // base layout
      .layering(d3Dag.layeringLongestPath())
      .decross(d3Dag.decrossOpt()) // minimize number of crossings
      .nodeSize((node) => [(node ? 3.8 : 0.25) * nodeRadius, 3 * nodeRadius]); // set node size instead of constraining to fit
    const { width, height } = layout(dag as any);
    setDag(dag);
    setLayoutHeight(height);
    setLayoutWidth(width);
  }, []);

  return width < 10 ? null : (
    <>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 2}
        scaleXMax={4}
        scaleYMin={1 / 2}
        scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => (
          <>
            <svg
              width={width}
              height={height}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab",
                touchAction: "none"
              }}
              ref={zoom.containerRef}
              onTouchStart={zoom.dragStart}
              onTouchMove={zoom.dragMove}
              onTouchEnd={zoom.dragEnd}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd();
              }}
              onDoubleClick={(event) => {
                const point = localPoint(event) || { x: 0, y: 0 };
                console.log(point);
                zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
              }}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 -5 10 10"
                  refX="15"
                  refY="-.5"
                  markerWidth="4"
                  markerHeight="4"
                  orient="auto"
                  fill="#fff"
                >
                  <path d="M0,-5L10,0L0,5" />
                </marker>
              </defs>
              <LinearGradient id="lg" from={peach} to={pink} />
              <rect width={width} height={height} rx={14} fill={background} />
              <Group top={margin.top} left={margin.left}>
                {dag.links().map((link, i) => (
                  <LinkHorizontal
                    key={`link-${i}`}
                    data={link}
                    stroke={lightpurple}
                    strokeWidth="1"
                    fill="none"
                    x={(node: any) => node.y - nodeWidth / 2 + 1}
                    markerEnd="url(#arrow)"
                  />
                  // <CustomLink key={`link-${i}`} link={link} />
                ))}
                {dag.descendants().map((node, i) => (
                  <Group
                    top={node.x}
                    left={node.y}
                    style={{ cursor: "pointer" }}
                    onClick={() => alert(`Clicked : ${node.data.id}`)}
                    onMouseOver={() => console.log(`Hovered : ${node.data.id}`)}
                  >
                    {/* <circle r={12} fill="url('#lg')" style={{ cursor: "pointer" }} /> */}
                    <rect
                      height={nodeHeight}
                      width={nodeWidth}
                      y={-nodeHeight / 2}
                      x={-nodeWidth / 2}
                      fill={background}
                      opacity={1}
                      stroke={blue}
                      strokeWidth={1}
                    />
                    <text
                      dy=".33em"
                      fontSize={9}
                      fontFamily="Arial"
                      textAnchor="middle"
                      fill={green}
                      style={{ pointerEvents: "none" }}
                    >
                      {node.data.id}
                    </text>
                  </Group>
                ))}
              </Group>
            </svg>
            <div className="controls">
              <button
                type="button"
                className="btn btn-zoom"
                onClick={() => {
                  console.log("here", zoom);
                  return zoom.scale({ scaleX: 1.2, scaleY: 1.2 });
                }}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-zoom btn-bottom"
                onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
              >
                -
              </button>
              <button
                type="button"
                className="btn btn-lg"
                onClick={zoom.center}
              >
                Center
              </button>
              <button type="button" className="btn btn-lg" onClick={zoom.reset}>
                Reset
              </button>
              <button type="button" className="btn btn-lg" onClick={zoom.clear}>
                Clear
              </button>
            </div>
          </>
        )}
      </Zoom>
      <style jsx>{`
        .btn {
          margin: 0;
          text-align: center;
          border: none;
          background: #2f2f2f;
          color: #888;
          padding: 0 4px;
          border-top: 1px solid #0a0a0a;
        }
        .btn-lg {
          font-size: 12px;
          line-height: 1;
          padding: 4px;
        }
        .btn-zoom {
          width: 26px;
          font-size: 22px;
        }
        .btn-bottom {
          margin-bottom: 1rem;
        }
        .description {
          font-size: 12px;
          margin-right: 0.25rem;
        }
        .controls {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .mini-map {
          position: absolute;
          bottom: 25px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .relative {
          position: relative;
        }
      `}</style>
    </>
  );
};

export default ExampleDag;
