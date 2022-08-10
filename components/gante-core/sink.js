import { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import useGante from './useGante';
import useCurrentDate from './useCurrentDate';
import { connectTo } from './svgtool';
import { Position } from './utils';
import moment from 'moment';

/*
  泳道，绘制一个通道, 绘制连线
*/
export default function Sink() {
  const {
    list,
    listMap,
    currentId,
    startTime,
    endTime,
    SINK_HEIGHT,
    SPOT_WIDTH,
    currentFeatures
  } = useGante();

  const currentTime = useCurrentDate();
  const currentNode = listMap[currentId];
  const OFFSET_DAY = moment(currentTime).startOf('day').diff(startTime, 'days');

  const getNodeLeft = useCallback((currentNode) => {
    if (currentNode) {
      const day = moment(currentNode.startTime).diff(moment(startTime).startOf('day'), 'days');
      return day * SPOT_WIDTH;
    }
    return 0;
  }, [startTime]);

  const getNodeWidth = useCallback((item) => {
      const day = moment(item.endTime).diff(moment(item.startTime).startOf('day'), 'days');
      return day * SPOT_WIDTH;
  }, []);

  const getNodeTop = useCallback((item) => {
    return list.indexOf(item) * SINK_HEIGHT + 3;
  }, [list]);


  const left = useMemo(() => {
    return getNodeLeft(currentNode);
  }, [currentNode, getNodeLeft]);

  return (
    <svg width="100%" height="100%" style={{ height: Math.max(list.length, 20) * SINK_HEIGHT}} className="pointer-events-none bg-gray-200">
      <g>
        {
          (() => {
            const length = list.length;
            const arg = [];
            for (let index = 0; index < Math.max(length, 20); ++index) {
              const features = (list[index] || {}).id === currentId ? (currentFeatures || {}) : {};

              arg.push(
                <line key={index}
                  x1={0} y1={(index + 1) * SINK_HEIGHT}
                  x2="100%" y2={(index + 1) * SINK_HEIGHT}
                  className={classNames(
                    "stroke",
                    features.movex ? 'stroke-sky-500 stroke-2' : 'stroke-gray-400/25'
                  )}
                />
              );
            }

            return arg;
          })()
        }
      </g>
      {/* 今天的区域 */}
      <rect
        width={SPOT_WIDTH}
        height="100%"
        x={SPOT_WIDTH * OFFSET_DAY}
        y="0"
        className="fill-red-500/25"
      />
      <g>
        {
          currentFeatures?.sort && currentNode && (
            <line x1={left} x2={left} y1={0} y2="100%" className="stroke-sky-500 stroke-2"></line>
          )
        }
      </g>

      <defs>
        <marker id="triangle"
          fill="black"
          strokeWidth="2px"
          viewBox="0 0 10 10"
          refX="1" refY="5"
          markerUnits="strokeWidth"
          markerWidth="10" markerHeight="10"
          orient="auto" />
      </defs>

      <g className="stroke-2 stroke-orange-500" fill="transparent">
        {
          // 处理connectTo
          (() => {
            let arg = [];
            for (let i = 0; i < list.length; ++i) {
              const node = list[i];
              if (node.connectTo && node.connectTo.length) {
                const left = getNodeLeft(node);
                const width = getNodeWidth(node);
                const top = getNodeTop(node);

                const fromPoint = new Position(
                  left + width + 24,
                  top + (SINK_HEIGHT - 6)/ 2,
                );

                arg = arg.concat(node.connectTo.map((t, idx) => {
                  const k = `${node.id}-${idx}`;
                  const tNode = listMap[t];

                  if (!tNode) {
                    return null;
                  }

                  const tLeft = getNodeLeft(tNode);
                  const tWidth = getNodeWidth(tNode);
                  const tTop = getNodeTop(tNode);

                  const toPoint = new Position(
                    tLeft,
                    tTop + (SINK_HEIGHT - 6) / 2
                  );

                  const d = connectTo(fromPoint, toPoint);

                  arg.push(
                    <path key={k} d={d} markerEnd="url(#triangle)" ></path>
                  );
                }));
              }
            }

            return arg;
          })()
        }
      </g>
    </svg>
  );
}
