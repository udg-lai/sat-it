import { Y as store_get, Z as ensure_array_like, _ as unsubscribe_stores, t as pop, $ as once, W as escape_html, a0 as attr, p as push, X as getContext, a1 as spread_attributes, a2 as clsx, a3 as stringify, a4 as copy_payload, a5 as assign_payload, a6 as bind_props, a7 as rest_props, a8 as fallback, q as setContext, a9 as slot, aa as spread_props, ab as current_component, ac as element, ad as sanitize_slots, ae as invalid_default_snippet, af as sanitize_props } from './index-CAgZ1EQM.js';
import katex from 'katex';
import crypto from 'crypto';
import { w as writable } from './exports-BuL_MyGI.js';

// This alphabet uses `A-Za-z0-9_-` symbols.
// The order of characters is optimized for better gzip and brotli compression.
// Same as in non-secure/index.js
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;

let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};

let nanoid = (size = 21) => {
  // `|=` convert `size` to number to prevent `valueOf` abusing and pool pollution
  fillPool((size |= 0));
  let id = '';
  // We are reading directly from the random pool to avoid creating new array
  for (let i = poolOffset - size; i < poolOffset; i++) {
    // It is incorrect to use bytes exceeding the alphabet size.
    // The following mask reduces the random byte in the 0-255 value
    // range to the 0-63 value range. Therefore, adding hacks, such
    // as empty string fallback or magic numbers, is unneccessary because
    // the bitmask trims bytes down to the alphabet size.
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */

const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = v => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
const oppositeAlignmentMap = {
  start: 'end',
  end: 'start'
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === 'function' ? value(param) : value;
}
function getSide(placement) {
  return placement.split('-')[0];
}
function getAlignment(placement) {
  return placement.split('-')[1];
}
function getOppositeAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}
function getAxisLength(axis) {
  return axis === 'y' ? 'height' : 'width';
}
function getSideAxis(placement) {
  return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === undefined) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr = ['left', 'right'];
  const rl = ['right', 'left'];
  const tb = ['top', 'bottom'];
  const bt = ['bottom', 'top'];
  switch (side) {
    case 'top':
    case 'bottom':
      if (rtl) return isStart ? rl : lr;
      return isStart ? lr : rl;
    case 'left':
    case 'right':
      return isStart ? tb : bt;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === 'start', rtl);
  if (alignment) {
    list = list.map(side => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    x,
    y
  };
}

function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === 'y';
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case 'top':
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case 'bottom':
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case 'right':
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case 'left':
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case 'start':
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case 'end':
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 *
 * This export does not have any `platform` interface logic. You will need to
 * write one for the platform you are using Floating UI with.
 */
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = 'bottom',
    strategy = 'absolute',
    middleware = [],
    platform
  } = config;
  const validMiddleware = middleware.filter(Boolean);
  const rtl = await (platform.isRTL == null ? undefined : platform.isRTL(floating));
  let rects = await platform.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let middlewareData = {};
  let resetCount = 0;
  for (let i = 0; i < validMiddleware.length; i++) {
    const {
      name,
      fn
    } = validMiddleware[i];
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform,
      elements: {
        reference,
        floating
      }
    });
    x = nextX != null ? nextX : x;
    y = nextY != null ? nextY : y;
    middlewareData = {
      ...middlewareData,
      [name]: {
        ...middlewareData[name],
        ...data
      }
    };
    if (reset && resetCount <= 50) {
      resetCount++;
      if (typeof reset === 'object') {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};

/**
 * Resolves with an object of overflow side offsets that determine how much the
 * element is overflowing a given clipping boundary on each side.
 * - positive = overflowing the boundary by that number of pixels
 * - negative = how many pixels left before it will overflow
 * - 0 = lies flush with the boundary
 * @see https://floating-ui.com/docs/detectOverflow
 */
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === undefined) {
    options = {};
  }
  const {
    x,
    y,
    platform,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = 'clippingAncestors',
    rootBoundary = 'viewport',
    elementContext = 'floating',
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
    element: ((_await$platform$isEle = await (platform.isElement == null ? undefined : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? undefined : platform.getDocumentElement(elements.floating))),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === 'floating' ? {
    x,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform.getOffsetParent == null ? undefined : platform.getOffsetParent(elements.floating));
  const offsetScale = (await (platform.isElement == null ? undefined : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? undefined : platform.getScale(offsetParent))) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip$1 = function (options) {
  if (options === undefined) {
    options = {};
  }
  return {
    name: 'flip',
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = 'bestFit',
        fallbackAxisSideDirection = 'none',
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);

      // If a reset by the arrow was caused due to an alignment offset being
      // added, we should skip any logic now since `flip()` has already done its
      // work.
      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform.isRTL == null ? undefined : platform.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== 'none';
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? undefined : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides[0]], overflow[sides[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];

      // One or more sides is overflowing.
      if (!overflows.every(side => side <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? undefined : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          // Try next placement and re-run the lifecycle.
          return {
            data: {
              index: nextIndex,
              overflows: overflowsData
            },
            reset: {
              placement: nextPlacement
            }
          };
        }

        // First, find the candidates that fit on the mainAxis side of overflow,
        // then find the placement that fits the best on the main crossAxis side.
        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? undefined : _overflowsData$filter.placement;

        // Otherwise fallback.
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case 'bestFit':
              {
                var _overflowsData$filter2;
                const placement = (_overflowsData$filter2 = overflowsData.filter(d => {
                  if (hasFallbackAxisSideDirection) {
                    const currentSideAxis = getSideAxis(d.placement);
                    return currentSideAxis === initialSideAxis ||
                    // Create a bias to the `y` side axis due to horizontal
                    // reading directions favoring greater width.
                    currentSideAxis === 'y';
                  }
                  return true;
                }).map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? undefined : _overflowsData$filter2[0];
                if (placement) {
                  resetPlacement = placement;
                }
                break;
              }
            case 'initialPlacement':
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.

async function convertValueToCoords(state, options) {
  const {
    placement,
    platform,
    elements
  } = state;
  const rtl = await (platform.isRTL == null ? undefined : platform.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === 'y';
  const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === 'number' ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === 'number') {
    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset$1 = function (options) {
  if (options === undefined) {
    options = 0;
  }
  return {
    name: 'offset',
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);

      // If the placement is the same and the arrow caused an alignment offset
      // then we don't need to change the positioning coordinates.
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? undefined : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift$1 = function (options) {
  if (options === undefined) {
    options = {};
  }
  return {
    name: 'shift',
    options,
    async fn(state) {
      const {
        x,
        y,
        placement
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: _ref => {
            let {
              x,
              y
            } = _ref;
            return {
              x,
              y
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x,
        y
      };
      const overflow = await detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === 'y' ? 'top' : 'left';
        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
        const min = mainAxisCoord + overflow[minSide];
        const max = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min, mainAxisCoord, max);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === 'y' ? 'top' : 'left';
        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
        const min = crossAxisCoord + overflow[minSide];
        const max = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min, crossAxisCoord, max);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};

function hasWindow() {
  return typeof window !== 'undefined';
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || '').toLowerCase();
  }
  // Mocked nodes in testing environments may not be instances of Node. By
  // returning `#document` an infinite loop won't occur.
  // https://github.com/floating-ui/floating-ui/issues/2317
  return '#document';
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? undefined : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? undefined : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === 'undefined') {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
}
function isTableElement(element) {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}
function isTopLayer(element) {
  return [':popover-open', ':modal'].some(selector => {
    try {
      return element.matches(selector);
    } catch (e) {
      return false;
    }
  });
}
function isContainingBlock(elementOrCss) {
  const webkit = isWebKit();
  const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  // https://drafts.csswg.org/css-transforms-2/#individual-transforms
  return ['transform', 'translate', 'scale', 'rotate', 'perspective'].some(value => css[value] ? css[value] !== 'none' : false) || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('-webkit-backdrop-filter', 'none');
}
function isLastTraversableNode(node) {
  return ['html', 'body', '#document'].includes(getNodeName(node));
}
function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === 'html') {
    return node;
  }
  const result =
  // Step into the shadow DOM of the parent of a slotted node.
  node.assignedSlot ||
  // DOM Element detected.
  node.parentNode ||
  // ShadowRoot detected.
  isShadowRoot(node) && node.host ||
  // Fallback.
  getDocumentElement(node);
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === undefined) {
    list = [];
  }
  if (traverseIframes === undefined) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? undefined : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}

function getCssDimensions(element) {
  const css = getComputedStyle(element);
  // In testing environments, the `width` and `height` properties are empty
  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}

function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}

function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;

  // 0, NaN, or Infinity should always fallback to 1.

  if (!x || !Number.isFinite(x)) {
    x = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x,
    y
  };
}

const noOffsets = /*#__PURE__*/createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === undefined) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}

function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === undefined) {
    includeScale = false;
  }
  if (isFixedStrategy === undefined) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x,
    y
  });
}

// If <html> has a CSS width greater than the viewport, then this will be
// incorrect for RTL.
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}

function getHTMLOffset(documentElement, scroll, ignoreScrollbarX) {
  if (ignoreScrollbarX === undefined) {
    ignoreScrollbarX = false;
  }
  const htmlRect = documentElement.getBoundingClientRect();
  const x = htmlRect.left + scroll.scrollLeft - (ignoreScrollbarX ? 0 :
  // RTL <body> scrollbar.
  getWindowScrollBarX(documentElement, htmlRect));
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x,
    y
  };
}

function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === 'fixed';
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll, true) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}

function getClientRects(element) {
  return Array.from(element.getClientRects());
}

// Gets the entire size of the scrollable document area, even extending outside
// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle(body).direction === 'rtl') {
    x += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x,
    y
  };
}

function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x,
    y
  };
}

// Returns the inner client rect, subtracting scrollbars if present.
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === 'viewport') {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === 'document') {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
}

// A "clipping ancestor" is an `overflow` element with the characteristic of
// clipping (or hiding) child elements. This returns all clipping ancestors
// of the given element up the tree.
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle(element).position === 'fixed';
  let currentNode = elementIsFixed ? getParentNode(element) : element;

  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      // Drop non-containing blocks.
      result = result.filter(ancestor => ancestor !== currentNode);
    } else {
      // Record last containing block for next iteration.
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}

// Gets the maximum area that the element is visible in due to any number of
// clipping ancestors.
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === 'clippingAncestors' ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}

function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}

function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
      // Firefox with layout.scrollbar.side = 3 in about:config to test this.
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}

function isStaticPositioned(element) {
  return getComputedStyle(element).position === 'static';
}

function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;

  // Firefox returns the <html> element as the offsetParent if it's non-static,
  // while Chrome and Safari return the <body> element. The <body> element must
  // be used to perform the correct calculations even if the <html> element is
  // non-static.
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}

// Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}

const getElementRects = async function (data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};

function isRTL(element) {
  return getComputedStyle(element).direction === 'rtl';
}

const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};

function rectsAreEqual(a, b) {
  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

// https://samthor.au/2021/observing-dom/
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === undefined) {
      skip = false;
    }
    if (threshold === undefined) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          // If the reference is clipped, the ratio is 0. Throttle the refresh
          // to prevent an infinite loop of updates.
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1000);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        // It's possible that even though the ratio is reported as 1, the
        // element is not actually fully within the IntersectionObserver's root
        // area anymore. This can happen under performance constraints. This may
        // be a bug in the browser's IntersectionObserver implementation. To
        // work around this, we compare the element's bounding rect now with
        // what it was at the time we created the IntersectionObserver. If they
        // are not equal then the element moved, so we refresh.
        refresh();
      }
      isFirstUpdate = false;
    }

    // Older browsers don't support a `document` as the root and will throw an
    // error.
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}

/**
 * Automatically updates the position of the floating element when necessary.
 * Should only be called when the floating element is mounted on the DOM or
 * visible on the screen.
 * @returns cleanup function that should be invoked when the floating element is
 * removed from the DOM or hidden from the screen.
 * @see https://floating-ui.com/docs/autoUpdate
 */
function autoUpdate(reference, floating, update, options) {
  if (options === undefined) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === 'function',
    layoutShift = typeof IntersectionObserver === 'function',
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
  ancestors.forEach(ancestor => {
    ancestorScroll && ancestor.addEventListener('scroll', update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener('resize', update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver(_ref => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        // Prevent update loops when using the `size` middleware.
        // https://github.com/floating-ui/floating-ui/issues/1740
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.removeEventListener('scroll', update);
      ancestorResize && ancestor.removeEventListener('resize', update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 * @see https://floating-ui.com/docs/offset
 */
const offset = offset$1;

/**
 * Optimizes the visibility of the floating element by shifting it in order to
 * keep it in view when it will overflow the clipping boundary.
 * @see https://floating-ui.com/docs/shift
 */
const shift = shift$1;

/**
 * Optimizes the visibility of the floating element by flipping the `placement`
 * in order to keep it in view when the preferred placement(s) will overflow the
 * clipping boundary. Alternative to `autoPlacement`.
 * @see https://floating-ui.com/docs/flip
 */
const flip = flip$1;

/**
 * Computes the `x` and `y` coordinates that will place the floating element
 * next to a given reference element.
 */
const computePosition = (reference, floating, options) => {
  // This caches the expensive `getClippingElementAncestors` function so that
  // multiple lifecycle resets re-use the same result. It only lives for a
  // single call. If other functions become expensive, we can add them as well.
  const cache = new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};

const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    prefix
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;
const getPrefixedClassGroupEntries = (classGroupEntries, prefix) => {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(([classGroupId, classGroup]) => {
    const prefixedClassGroup = classGroup.map(classDefinition => {
      if (typeof classDefinition === 'string') {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === 'object') {
        return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
};

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const createParseClassName = config => {
  const {
    separator,
    experimentalParseClassName
  } = config;
  const isSeparatorSingleCharacter = separator.length === 1;
  const firstSeparatorCharacter = separator[0];
  const separatorLength = separator.length;
  // parseClassName inspired by https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
  const parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (experimentalParseClassName) {
    return className => experimentalParseClassName({
      className,
      parseClassName
    });
  }
  return parseClassName;
};
/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const sortModifiers = modifiers => {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  const sortedModifiers = [];
  let unsortedModifiers = [];
  modifiers.forEach(modifier => {
    const isArbitraryVariant = modifier[0] === '[';
    if (isArbitraryVariant) {
      sortedModifiers.push(...unsortedModifiers.sort(), modifier);
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push(...unsortedModifiers.sort());
  return sortedModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
const fractionRegex = /^\d+\/\d+$/;
const stringLengths = /*#__PURE__*/new Set(['px', 'full', 'screen']);
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isLength = value => isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, 'length', isLengthOnly);
const isNumber = value => Boolean(value) && !Number.isNaN(Number(value));
const isArbitraryNumber = value => getIsArbitraryValue(value, 'number', isNumber);
const isInteger = value => Boolean(value) && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isTshirtSize = value => tshirtUnitRegex.test(value);
const sizeLabels = /*#__PURE__*/new Set(['length', 'size', 'percentage']);
const isArbitrarySize = value => getIsArbitraryValue(value, sizeLabels, isNever);
const isArbitraryPosition = value => getIsArbitraryValue(value, 'position', isNever);
const imageLabels = /*#__PURE__*/new Set(['image', 'url']);
const isArbitraryImage = value => getIsArbitraryValue(value, imageLabels, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, '', isShadow);
const isAny = () => true;
const getIsArbitraryValue = (value, label, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return typeof label === 'string' ? result[1] === label : label.has(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const getDefaultConfig = () => {
  const colors = fromTheme('colors');
  const spacing = fromTheme('spacing');
  const blur = fromTheme('blur');
  const brightness = fromTheme('brightness');
  const borderColor = fromTheme('borderColor');
  const borderRadius = fromTheme('borderRadius');
  const borderSpacing = fromTheme('borderSpacing');
  const borderWidth = fromTheme('borderWidth');
  const contrast = fromTheme('contrast');
  const grayscale = fromTheme('grayscale');
  const hueRotate = fromTheme('hueRotate');
  const invert = fromTheme('invert');
  const gap = fromTheme('gap');
  const gradientColorStops = fromTheme('gradientColorStops');
  const gradientColorStopPositions = fromTheme('gradientColorStopPositions');
  const inset = fromTheme('inset');
  const margin = fromTheme('margin');
  const opacity = fromTheme('opacity');
  const padding = fromTheme('padding');
  const saturate = fromTheme('saturate');
  const scale = fromTheme('scale');
  const sepia = fromTheme('sepia');
  const skew = fromTheme('skew');
  const space = fromTheme('space');
  const translate = fromTheme('translate');
  const getOverscroll = () => ['auto', 'contain', 'none'];
  const getOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const getSpacingWithAutoAndArbitrary = () => ['auto', isArbitraryValue, spacing];
  const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
  const getLengthWithEmptyAndArbitrary = () => ['', isLength, isArbitraryLength];
  const getNumberWithAutoAndArbitrary = () => ['auto', isNumber, isArbitraryValue];
  const getPositions = () => ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'];
  const getLineStyles = () => ['solid', 'dashed', 'dotted', 'double', 'none'];
  const getBlendModes = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const getAlign = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'];
  const getZeroAndEmpty = () => ['', '0', isArbitraryValue];
  const getBreaks = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
  return {
    cacheSize: 500,
    separator: ':',
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: ['none', '', isTshirtSize, isArbitraryValue],
      brightness: getNumberAndArbitrary(),
      borderColor: [colors],
      borderRadius: ['none', '', 'full', isTshirtSize, isArbitraryValue],
      borderSpacing: getSpacingWithArbitrary(),
      borderWidth: getLengthWithEmptyAndArbitrary(),
      contrast: getNumberAndArbitrary(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: getSpacingWithArbitrary(),
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAutoAndArbitrary(),
      margin: getSpacingWithAutoAndArbitrary(),
      opacity: getNumberAndArbitrary(),
      padding: getSpacingWithArbitrary(),
      saturate: getNumberAndArbitrary(),
      scale: getNumberAndArbitrary(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: getSpacingWithArbitrary(),
      translate: getSpacingWithArbitrary()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', 'video', isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: [...getPositions(), isArbitraryValue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ['auto', isInteger, isArbitraryValue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: getSpacingWithAutoAndArbitrary()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['wrap', 'wrap-reverse', 'nowrap']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ['1', 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ['first', 'last', 'none', isInteger, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: ['auto', {
          span: ['full', isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: ['auto', {
          span: [isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: ['normal', ...getAlign()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': ['start', 'end', 'center', 'stretch']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...getAlign(), 'baseline']
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', 'start', 'end', 'center', 'stretch', 'baseline']
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': [...getAlign(), 'baseline']
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      'space-x': [{
        'space-x': [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      'space-y': [{
        'space-y': [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-y-reverse': ['space-y-reverse'],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ['auto', 'min', 'max', 'fit', 'svw', 'lvw', 'dvw', isArbitraryValue, spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [isArbitraryValue, spacing, 'min', 'max', 'fit']
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [isArbitraryValue, spacing, 'none', 'full', 'min', 'max', 'fit', 'prose', {
          screen: [isTshirtSize]
        }, isTshirtSize]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit']
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black', isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest', isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': ['none', isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', isLength, isArbitraryValue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['none', 'disc', 'decimal', isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      'placeholder-opacity': [{
        'placeholder-opacity': [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      'text-opacity': [{
        'text-opacity': [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...getLineStyles(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: ['auto', 'from-font', isLength, isArbitraryLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': ['auto', isLength, isArbitraryValue]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: getSpacingWithArbitrary()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      'bg-opacity': [{
        'bg-opacity': [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: [...getPositions(), isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: ['no-repeat', {
          repeat: ['', 'x', 'y', 'round', 'space']
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: ['auto', 'cover', 'contain', isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          'gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
        }, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      'border-opacity': [{
        'border-opacity': [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...getLineStyles(), 'hidden']
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x': [{
        'divide-x': [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y': [{
        'divide-y': [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      'divide-opacity': [{
        'divide-opacity': [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      'divide-style': [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': [borderColor]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': [borderColor]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: ['', ...getLineStyles()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isLength, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: [isLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w': [{
        ring: getLengthWithEmptyAndArbitrary()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      'ring-color': [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      'ring-opacity': [{
        'ring-opacity': [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      'ring-offset-w': [{
        'ring-offset': [isLength, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      'ring-offset-color': [{
        'ring-offset': [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ['', 'inner', 'none', isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      'shadow-color': [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...getBlendModes(), 'plus-lighter', 'plus-darker']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ['', 'none']
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': ['', 'none', isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': ['', 'none']
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['none', 'all', '', 'colors', 'opacity', 'shadow', 'transform', isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'in', 'out', 'in-out', isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', 'spin', 'ping', 'pulse', 'bounce', isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ['', 'gpu', 'none']
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ['auto', colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['none', 'auto']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', 'y', 'x', '']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, 'none']
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, 'none']
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    }
  };
};
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
async function tick() {
}
function MathTexComponent($$payload, $$props) {
  push();
  let { equation, fontSize = "var(--TeX-font-size)" } = $$props;
  const equationHtml = katex.renderToString(equation, { displayMode: true, output: "mathml" });
  $$payload.out += `<span${attr("style", `--fontSize:${stringify(fontSize)}`)} class="svelte-1w99v4o">${html(equationHtml)}</span>`;
  pop();
}
function logicResolution(c1, c2) {
  const resolvedLiterals = /* @__PURE__ */ new Map();
  c1.forEach((lit) => resolvedLiterals.set(lit.toInt(), lit.copy()));
  let foundComplementary = false;
  for (const lit of c2) {
    const litId = lit.toInt();
    if (resolvedLiterals.has(litId * -1) && !foundComplementary) {
      resolvedLiterals.delete(litId * -1);
      foundComplementary = true;
    } else if (!resolvedLiterals.has(litId)) {
      resolvedLiterals.set(litId, lit.copy());
    }
  }
  return new Clause(Array.from(resolvedLiterals.values()));
}
function arraysEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}
const toasts = writable([]);
const dismissToast = (id) => {
  toasts.update((all) => all.filter((t) => t.id !== id));
};
const DEFAULT_TIMEOUT = 1e4;
const BREAKPOINT_TIMEOUT = 12e3;
const SAT_TIMEOUT = DEFAULT_TIMEOUT;
const UNSAT_TIMEOUT = DEFAULT_TIMEOUT;
const INFO_TIMEOUT = DEFAULT_TIMEOUT;
const WARNING_TIMEOUT = 3 * DEFAULT_TIMEOUT;
const addToast = (toast) => {
  const id = Math.floor(Math.random() * 1e4);
  const defaults = {
    id,
    type: "info",
    title: "<empty>",
    description: "<empty>",
    dismissible: false,
    timeout: DEFAULT_TIMEOUT
  };
  const t = { ...defaults, ...toast };
  toasts.update((all) => [t, ...all]);
  if (t.dismissible && t.timeout) setTimeout(() => dismissToast(id), t.timeout);
};
const logWarning = (title, description) => {
  console.info("title:\n", title, "\ndescription:\n", description);
  addToast({
    type: "warn",
    title: formatText(title),
    description: formatText(description),
    dismissible: true,
    timeout: WARNING_TIMEOUT
  });
};
const logInfo = (title, description) => {
  addToast({
    type: "info",
    title: formatText(title),
    description: formatText(description),
    dismissible: true,
    timeout: INFO_TIMEOUT
  });
};
const logBreakpoint = (title, description) => {
  addToast({
    type: "breakpoint",
    title: formatText(title),
    description: formatText(description),
    dismissible: true,
    timeout: BREAKPOINT_TIMEOUT
  });
};
const logError = (title, description) => {
  console.error("title:\n", title, "\ndescription:\n", description);
  addToast({
    type: "error",
    title: formatText(title),
    description: formatText(description),
    dismissible: false
  });
};
const logSAT = (description) => {
  console.info("sat:", description);
  addToast({
    type: "sat",
    title: "SAT",
    description: formatText(description),
    dismissible: true,
    timeout: SAT_TIMEOUT
  });
};
const logUnSAT = (description) => {
  console.warn("UNSAT:", description);
  addToast({
    type: "unsat",
    title: "UNSAT",
    description: formatText(description),
    dismissible: true,
    timeout: UNSAT_TIMEOUT
  });
};
function logFatal(title, description) {
  logError(title, description);
  throw title;
}
const formatText = (text) => {
  return text === undefined ? "" : text.at(0)?.toUpperCase() + text.substring(1).toLowerCase();
};
class Clause {
  static idGenerator = 0;
  literals = [];
  id;
  constructor(literals = []) {
    this.id = this.generateUniqueId();
    this.literals = literals;
  }
  static resetUniqueIdGenerator() {
    Clause.idGenerator = 0;
  }
  static nextUniqueId() {
    return Clause.idGenerator;
  }
  generateUniqueId() {
    const id = Clause.idGenerator;
    Clause.idGenerator += 1;
    return id;
  }
  getId() {
    return this.id;
  }
  setId(newId) {
    this.id = newId;
  }
  addLiteral(lit) {
    this.literals.push(lit);
  }
  findUnassignedLiteral() {
    let i = 0;
    let literal = undefined;
    while (i < this.literals.length && !literal) {
      if (!this.literals[i].isAssigned()) {
        literal = this.literals[i].toInt();
      } else {
        i++;
      }
    }
    if (!literal) {
      throw logFatal("Non unassigned literal was found");
    }
    return literal;
  }
  eval() {
    let satisfied = false;
    const unassignedLiterals = [];
    let i = 0;
    while (i < this.literals.length && !satisfied) {
      const lit = this.literals[i];
      if (lit.isTrue()) satisfied = true;
      else {
        if (!lit.isAssigned()) unassignedLiterals.push(lit.toInt());
        i++;
      }
    }
    let state;
    if (satisfied) state = makeSatClause();
    else if (unassignedLiterals.length === 1) state = makeUnitClause(unassignedLiterals[0]);
    else if (unassignedLiterals.length === 0) state = makeUnSATClause();
    else state = makeUnresolvedClause();
    return state;
  }
  isUnit() {
    return this.optimalCheckUnit();
  }
  containsVariable(variableId) {
    const found = this.literals.find((lit) => {
      const id = lit.toInt();
      return Math.abs(id) === variableId;
    });
    return found !== undefined;
  }
  getLiterals() {
    return [...this.literals];
  }
  optimalCheckUnit() {
    let nNotAssigned = 0;
    let i = 0;
    const len = this.literals.length;
    let satisfied = false;
    while (i < len && nNotAssigned < 2 && !satisfied) {
      const lit = this.literals[i];
      if (!lit.isAssigned()) {
        nNotAssigned += 1;
      } else {
        satisfied = lit.isTrue();
      }
      i++;
    }
    const unit = !satisfied && nNotAssigned == 1;
    return unit;
  }
  resolution(other) {
    return logicResolution(this, other);
  }
  equals(other) {
    const c1 = this.literals.map((l) => l.toInt());
    const c2 = other.literals.map((l) => l.toInt());
    return arraysEqual(c1.sort(), c2.sort());
  }
  nLiterals() {
    return this.literals.length;
  }
  [Symbol.iterator]() {
    return this.literals.values();
  }
  map(callback, thisArg) {
    return this.literals.map(callback, thisArg);
  }
  forEach(callback, thisArg) {
    this.literals.forEach(callback, thisArg);
  }
}
const makeSatClause = () => {
  return { type: "SAT" };
};
const makeUnSATClause = () => {
  return { type: "UnSAT" };
};
const makeUnitClause = (literal) => {
  return { type: "UNIT", literal };
};
const makeUnresolvedClause = () => {
  return { type: "UNRESOLVED" };
};
const isUnSATClause = (e) => {
  return e.type === "UnSAT";
};
const isSatClause = (e) => {
  return e.type === "SAT";
};
class Variable {
  id;
  assignment;
  constructor(id, assignment2 = undefined) {
    if (id < 0) throw "ERROR: variable ID should be >= 0";
    this.id = id;
    this.assignment = assignment2;
  }
  getInt() {
    return this.id;
  }
  isAssigned() {
    return this.assignment !== undefined;
  }
  isNotAssigned() {
    return !this.isAssigned();
  }
  getAssignment() {
    if (this.assignment === undefined) {
      logFatal("Evaluation of an undefined variable");
    }
    return this.assignment;
  }
  assign(assignment2) {
    this.assignment = assignment2;
  }
  unassign() {
    this.assignment = undefined;
  }
  negate() {
    if (this.isNotAssigned()) {
      logFatal("You can not negate the assigment of a non assigned variable");
    } else {
      this.assign(!this.assignment);
    }
  }
  copy() {
    const newVariable = new Variable(this.id, this.assignment);
    return newVariable;
  }
  equals(other) {
    return this.id === other.id;
  }
}
class Literal {
  variable;
  polarity;
  constructor(variable, polarity) {
    this.variable = variable;
    this.polarity = polarity;
  }
  getVariable() {
    return this.variable;
  }
  getPolarity() {
    return this.polarity;
  }
  isAssigned() {
    return this.variable.isAssigned();
  }
  /*Both functions isTrue and isFlase, will execute the function "evaluate" only if the function "isAssigned" is true*/
  isTrue() {
    return this.isAssigned() && this.evaluate();
  }
  isFalse() {
    return this.isAssigned() && !this.evaluate();
  }
  toTeX() {
    const variable = this.variable.getInt();
    return this.polarity == "Negative" ? `\\overline{${variable}}` : `${variable}`;
  }
  equals(other) {
    return this.toInt() === other.toInt();
  }
  toInt() {
    return this.variable.getInt() * (this.polarity === "Negative" ? -1 : 1);
  }
  copy() {
    return new Literal(this.variable, this.polarity);
  }
  evaluate() {
    if (this.variable.isNotAssigned()) {
      logFatal("Evaluating a literal with not assigned value", "The evaluation is given by its variable which is not yet assigned");
    }
    let evaluation = this.variable.getAssignment();
    if (this.polarity === "Negative") evaluation = !evaluation;
    return evaluation;
  }
}
const isJust = (m) => {
  return m.kind == "just";
};
const makeJust = (value) => ({ kind: "just", value });
const makeNothing = () => ({ kind: "nothing" });
const unwrapMaybe = ({ kind, value }) => {
  if (kind == "nothing") {
    throw new Error(`Attempted to unwrap a nothing value`);
  }
  return value;
};
const fromJust = unwrapMaybe;
class VariablePool {
  variables = [];
  capacity = 0;
  pointer = 0;
  #nextVariable = once(() => this.variables.at(this.pointer)?.getInt());
  get nextVariable() {
    return this.#nextVariable();
  }
  constructor(nVariables) {
    this.variables = new Array(nVariables).fill(null).map((_, index) => new Variable(index + 1));
    this.capacity = nVariables;
    this.pointer = 0;
  }
  reset() {
    this.variables.forEach((variable) => {
      variable.unassign();
    });
    this.pointer = 0;
  }
  nextVariableToAssign() {
    return this.getNextId();
  }
  allAssigned() {
    return this.pointer === this.capacity;
  }
  dispose(variable) {
    const varIndex = this.checkIndex(variable);
    this.unassignVariable(variable);
    this.updatePointer(varIndex, "dispose");
  }
  persist(variable, assignment2) {
    const varIndex = this.checkIndex(variable);
    this.checkAssignment(varIndex);
    this.assignVariable(variable, assignment2);
    this.updatePointer(varIndex, "persist");
  }
  get(variable) {
    const idx = this.checkIndex(variable);
    return this.variables[idx];
  }
  getCopy(variable) {
    return this.get(variable).copy();
  }
  nVariables() {
    return this.capacity;
  }
  assignedVariables() {
    return this.variables.filter((v) => v.isAssigned()).map((v) => v.getInt());
  }
  nonAssignedVariables() {
    return this.variables.filter((v) => !v.isAssigned()).map((v) => v.getInt());
  }
  assignVariable(id, evaluation) {
    const idx = this.checkIndex(id);
    this.variables[idx].assign(evaluation);
  }
  unassignVariable(id) {
    const idx = this.checkIndex(id);
    this.variables[idx].unassign();
  }
  getVariablesIDs() {
    return this.variables.map((variable) => variable.getInt());
  }
  updatePointer(varIndex, kind) {
    if (kind === "dispose") {
      this.pointer = Math.min(varIndex, this.pointer);
    } else {
      if (this.pointer === varIndex) {
        while (this.pointer < this.capacity && this.variables[this.pointer].isAssigned()) {
          this.pointer++;
        }
      }
    }
  }
  getNextId() {
    let nextFound = false;
    while (this.pointer < this.capacity && !nextFound) {
      const assigned = this.variables[this.pointer].isAssigned();
      if (!assigned) {
        nextFound = true;
      } else {
        this.pointer++;
      }
    }
    return nextFound ? makeJust(this.variables[this.pointer].getInt()) : makeNothing();
  }
  checkAssignment(idx) {
    if (this.variables[idx].isAssigned()) {
      logError(`Variable ${idx} is already assigned`);
    }
  }
  checkIndex(variableId) {
    const idx = this.variableToIndex(variableId);
    if (idx < 0 || idx >= this.variables.length) throw "[ERROR]: Trying to obtain an out-of-range variable from the table";
    return idx;
  }
  variableToIndex(variableId) {
    return variableId - 1;
  }
}
function literalSetToClause(literals, variables) {
  let clause;
  literals = literals.filter((lit) => lit !== 0);
  if (literals.length === 0) {
    logWarning("Literals to clause", "An empty clause has been created");
    clause = new Clause();
  } else {
    const literalInstances = literals.map((lit) => {
      const variable = Math.abs(lit);
      const polarity = lit < 0 ? "Negative" : "Positive";
      const literal = new Literal(variables.get(variable), polarity);
      return literal;
    });
    clause = new Clause(literalInstances);
  }
  return clause;
}
function cnfToClauseSet(cnf, variables) {
  return cnf.map((literals) => literalSetToClause(literals, variables));
}
let inspectedVariable = -1;
let clausesToCheck = [];
let checkingIndex = 0;
function updateClausesToCheck(toCheck, variable) {
  inspectedVariable = variable;
  checkingIndex = 0;
  clausesToCheck = [...toCheck];
}
const getInspectedVariable = () => inspectedVariable;
const getClausesToCheck = () => clausesToCheck;
const getCheckingIndex = () => checkingIndex;
const incrementCheckingIndex = () => {
  if (checkingIndex < clausesToCheck.length - 1) {
    checkingIndex++;
  }
};
function BacktrackingComponent($$payload, $$props) {
  push();
  let { assignment: assignment2, isLast, eventClick } = $$props;
  const inspectedVariable2 = getInspectedVariable();
  $$payload.out += `<backtracking><button${attr("class", `literal-style backtracking ${stringify("pad-others")} svelte-8253t7 ${stringify([
    assignment2.variableId() === inspectedVariable2 && isLast ? "inspecting" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  MathTexComponent($$payload, { equation: assignment2.toTeX() });
  $$payload.out += `<!----></button></backtracking>`;
  pop();
}
const isDecisionReason = (r) => {
  return r.type === "manual" || r.type === "automated";
};
const isUnitPropagationReason = (r) => {
  return r.type === "propagated";
};
const isBacktrackingReason = (r) => {
  return r.type === "backtracking";
};
const makeAutomatedReason = (algorithm) => {
  return {
    type: "automated",
    algorithm
  };
};
const makeManualReason = () => {
  return {
    type: "manual"
  };
};
const makeUnitPropagationReason = (clauseId) => {
  return {
    type: "propagated",
    clauseId
  };
};
const makeBacktrackingReason = () => {
  return {
    type: "backtracking"
  };
};
class VariableAssignment {
  variable;
  reason;
  constructor(variable, kind) {
    this.variable = variable;
    this.reason = kind;
  }
  static newAutomatedAssignment(variable, algorithm) {
    return new VariableAssignment(variable, makeAutomatedReason(algorithm));
  }
  static newManualAssignment(variable) {
    return new VariableAssignment(variable, makeManualReason());
  }
  static newUnitPropagationAssignment(variable, clauseId) {
    return new VariableAssignment(variable, makeUnitPropagationReason(clauseId));
  }
  static newBacktrackingAssignment(variable) {
    return new VariableAssignment(variable, makeBacktrackingReason());
  }
  copy() {
    return new VariableAssignment(this.variable, this.reason);
  }
  getVariable() {
    return this.variable;
  }
  isD() {
    return isDecisionReason(this.reason);
  }
  isUP() {
    return isUnitPropagationReason(this.reason);
  }
  isK() {
    return isBacktrackingReason(this.reason);
  }
  getReason() {
    return this.reason;
  }
  unassign() {
    this.variable.unassign();
  }
  toInt() {
    const assignment2 = this.variable.getAssignment();
    if (assignment2) {
      return this.variable.getInt();
    } else {
      return this.variable.getInt() * -1;
    }
  }
  variableId() {
    return this.variable.getInt();
  }
  toTeX() {
    if (this.variable.isNotAssigned()) {
      logFatal(
        "Evaluating a variable assignment with not assigned value",
        "The evaluation is given by its variable which is not yet assigned"
      );
    }
    const assignment2 = this.variable.getAssignment();
    const variable = this.variable.getInt();
    let text;
    if (assignment2) {
      text = variable.toString();
    } else {
      text = `\\overline{${variable}}`;
    }
    return text;
  }
}
const SvelteSet = globalThis.Set;
class ClausePool {
  clauses;
  constructor(clauses = []) {
    this.clauses = clauses;
  }
  static buildFrom(cnf, variables) {
    Clause.resetUniqueIdGenerator();
    const clauses = cnfToClauseSet(cnf, variables);
    return new ClausePool(clauses);
  }
  eval() {
    let unsat2 = false;
    let nSatisfied = 0;
    let i = 0;
    let conflicClause = undefined;
    while (i < this.clauses.length && !unsat2) {
      const clause = this.clauses[i];
      const clauseEval = clause.eval();
      unsat2 = isUnSATClause(clauseEval);
      if (!unsat2) {
        const sat2 = isSatClause(clauseEval);
        if (sat2) nSatisfied++;
        i++;
      } else {
        conflicClause = clause;
      }
    }
    let state;
    if (unsat2) {
      state = {
        type: "UnSAT",
        conflictClause: conflicClause?.getId()
      };
    } else if (nSatisfied === i) {
      state = { type: "SAT" };
    } else {
      state = { type: "UNRESOLVED" };
    }
    return state;
  }
  addClause(clause) {
    this.clauses.push(clause);
  }
  get(i) {
    if (i < 0 || i >= this.clauses.length) {
      throw "[ERROR]: accessing out of range for consulting a clause in the CNF";
    } else {
      return this.clauses[i];
    }
  }
  getUnitClauses() {
    const S = new SvelteSet();
    for (const c of this.getClauses()) {
      if (c.optimalCheckUnit()) S.add(c.getId());
    }
    return S;
  }
  getClauses() {
    return this.clauses;
  }
  leftToSatisfy() {
    let leftToSatisfy = 0;
    this.clauses.forEach((clause) => {
      const evaluation = clause.eval();
      if (!isSatClause(evaluation)) leftToSatisfy += 1;
    });
    return leftToSatisfy;
  }
  size() {
    return this.clauses.length;
  }
}
let problemStore = {
  variables: new VariablePool(0),
  clauses: new ClausePool(),
  mapping: /* @__PURE__ */ new Map(),
  algorithm: "backtracking"
};
const getProblemStore = () => problemStore;
const bgColors = {
  gray: "bg-gray-50 dark:bg-gray-800",
  red: "bg-red-50 dark:bg-gray-800",
  yellow: "bg-yellow-50 dark:bg-gray-800 ",
  green: "bg-green-50 dark:bg-gray-800 ",
  indigo: "bg-indigo-50 dark:bg-gray-800 ",
  purple: "bg-purple-50 dark:bg-gray-800 ",
  pink: "bg-pink-50 dark:bg-gray-800 ",
  blue: "bg-blue-50 dark:bg-gray-800 ",
  light: "bg-gray-50 dark:bg-gray-700",
  dark: "bg-gray-50 dark:bg-gray-800",
  default: "bg-white dark:bg-gray-800",
  dropdown: "bg-white dark:bg-gray-700",
  navbar: "bg-white dark:bg-gray-900",
  navbarUl: "bg-gray-50 dark:bg-gray-800",
  form: "bg-gray-50 dark:bg-gray-700",
  primary: "bg-primary-50 dark:bg-gray-800 ",
  orange: "bg-orange-50 dark:bg-orange-800",
  none: ""
};
function Frame($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "tag",
    "color",
    "rounded",
    "border",
    "shadow",
    "node",
    "use",
    "options",
    "role",
    "transition",
    "params",
    "open"
  ]);
  push();
  const noop = () => {
  };
  setContext("background", true);
  let tag = fallback($$props["tag"], () => $$restProps.href ? "a" : "div", true);
  let color = fallback($$props["color"], "default");
  let rounded = fallback($$props["rounded"], false);
  let border = fallback($$props["border"], false);
  let shadow = fallback($$props["shadow"], false);
  let node = fallback($$props["node"], () => undefined, true);
  let use = fallback($$props["use"], noop);
  let options = fallback($$props["options"], () => ({}), true);
  let role = fallback($$props["role"], () => undefined, true);
  let transition = fallback($$props["transition"], () => undefined, true);
  let params = fallback($$props["params"], () => ({}), true);
  let open = fallback($$props["open"], true);
  const textColors = {
    gray: "text-gray-800 dark:text-gray-300",
    red: "text-red-800 dark:text-red-400",
    yellow: "text-yellow-800 dark:text-yellow-300",
    green: "text-green-800 dark:text-green-400",
    indigo: "text-indigo-800 dark:text-indigo-400",
    purple: "text-purple-800 dark:text-purple-400",
    pink: "text-pink-800 dark:text-pink-400",
    blue: "text-blue-800 dark:text-blue-400",
    light: "text-gray-700 dark:text-gray-300",
    dark: "text-gray-700 dark:text-gray-300",
    default: "text-gray-500 dark:text-gray-400",
    dropdown: "text-gray-700 dark:text-gray-200",
    navbar: "text-gray-700 dark:text-gray-200",
    navbarUl: "text-gray-700 dark:text-gray-400",
    form: "text-gray-900 dark:text-white",
    primary: "text-primary-800 dark:text-primary-400",
    orange: "text-orange-800 dark:text-orange-400",
    none: ""
  };
  const borderColors = {
    gray: "border-gray-300 dark:border-gray-800 divide-gray-300 dark:divide-gray-800",
    red: "border-red-300 dark:border-red-800 divide-red-300 dark:divide-red-800",
    yellow: "border-yellow-300 dark:border-yellow-800 divide-yellow-300 dark:divide-yellow-800",
    green: "border-green-300 dark:border-green-800 divide-green-300 dark:divide-green-800",
    indigo: "border-indigo-300 dark:border-indigo-800 divide-indigo-300 dark:divide-indigo-800",
    purple: "border-purple-300 dark:border-purple-800 divide-purple-300 dark:divide-purple-800",
    pink: "border-pink-300 dark:border-pink-800 divide-pink-300 dark:divide-pink-800",
    blue: "border-blue-300 dark:border-blue-800 divide-blue-300 dark:divide-blue-800",
    light: "border-gray-500 divide-gray-500",
    dark: "border-gray-500 divide-gray-500",
    default: "border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700",
    dropdown: "border-gray-100 dark:border-gray-600 divide-gray-100 dark:divide-gray-600",
    navbar: "border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700",
    navbarUl: "border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700",
    form: "border-gray-300 dark:border-gray-700 divide-gray-300 dark:divide-gray-700",
    primary: "border-primary-500 dark:border-primary-200  divide-primary-500 dark:divide-primary-200 ",
    orange: "border-orange-300 dark:border-orange-800 divide-orange-300 dark:divide-orange-800",
    none: ""
  };
  let divClass;
  color = color ?? "default";
  setContext("color", color);
  divClass = twMerge(bgColors[color], textColors[color], rounded && "rounded-lg", border && "border", borderColors[color], shadow && "shadow-md", $$sanitized_props.class);
  if (transition && open) {
    $$payload.out += "<!--[-->";
    element(
      $$payload,
      tag,
      () => {
        $$payload.out += `${spread_attributes({
          role,
          ...$$restProps,
          class: clsx(divClass)
        })}`;
      },
      () => {
        $$payload.out += `<!---->`;
        slot($$payload, $$props, "default", {}, null);
        $$payload.out += `<!---->`;
      }
    );
  } else {
    $$payload.out += "<!--[!-->";
    if (open) {
      $$payload.out += "<!--[-->";
      element(
        $$payload,
        tag,
        () => {
          $$payload.out += `${spread_attributes({
            role,
            ...$$restProps,
            class: clsx(divClass)
          })}`;
        },
        () => {
          $$payload.out += `<!---->`;
          slot($$payload, $$props, "default", {}, null);
          $$payload.out += `<!---->`;
        }
      );
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, {
    tag,
    color,
    rounded,
    border,
    shadow,
    node,
    use,
    options,
    role,
    transition,
    params,
    open
  });
  pop();
}
function ToolbarButton($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "color",
    "name",
    "ariaLabel",
    "size",
    "href"
  ]);
  push();
  let color = fallback($$props["color"], "default");
  let name = fallback($$props["name"], () => undefined, true);
  let ariaLabel = fallback($$props["ariaLabel"], () => undefined, true);
  let size = fallback($$props["size"], "md");
  let href = fallback($$props["href"], () => undefined, true);
  const background = getContext("background");
  const colors = {
    dark: "text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600",
    gray: "text-gray-500 focus:ring-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-300",
    red: "text-red-500 focus:ring-red-400 hover:bg-red-200 dark:hover:bg-red-800 dark:hover:text-red-300",
    yellow: "text-yellow-500 focus:ring-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-800 dark:hover:text-yellow-300",
    green: "text-green-500 focus:ring-green-400 hover:bg-green-200 dark:hover:bg-green-800 dark:hover:text-green-300",
    indigo: "text-indigo-500 focus:ring-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 dark:hover:text-indigo-300",
    purple: "text-purple-500 focus:ring-purple-400 hover:bg-purple-200 dark:hover:bg-purple-800 dark:hover:text-purple-300",
    pink: "text-pink-500 focus:ring-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800 dark:hover:text-pink-300",
    blue: "text-blue-500 focus:ring-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 dark:hover:text-blue-300",
    primary: "text-primary-500 focus:ring-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 dark:hover:text-primary-300",
    default: "focus:ring-gray-400 hover:bg-gray-100"
  };
  const sizing = {
    xs: "m-0.5 rounded-sm focus:ring-1 p-0.5",
    sm: "m-0.5 rounded focus:ring-1 p-0.5",
    md: "m-0.5 rounded-lg focus:ring-2 p-1.5",
    lg: "m-0.5 rounded-lg focus:ring-2 p-2.5"
  };
  let buttonClass;
  const svgSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-5 h-5"
  };
  buttonClass = twMerge("focus:outline-none whitespace-normal", sizing[size], colors[color], color === "default" && (background ? "dark:hover:bg-gray-600" : "dark:hover:bg-gray-700"), $$sanitized_props.class);
  if (href) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${spread_attributes({
      href,
      ...$$restProps,
      class: clsx(buttonClass),
      "aria-label": ariaLabel ?? name
    })}>`;
    if (name) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<span class="sr-only">${escape_html(name)}</span>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <!---->`;
    slot($$payload, $$props, "default", { svgSize: svgSizes[size] }, null);
    $$payload.out += `<!----></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${spread_attributes({
      type: "button",
      ...$$restProps,
      class: clsx(buttonClass),
      "aria-label": ariaLabel ?? name
    })}>`;
    if (name) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<span class="sr-only">${escape_html(name)}</span>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <!---->`;
    slot($$payload, $$props, "default", { svgSize: svgSizes[size] }, null);
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { color, name, ariaLabel, size, href });
  pop();
}
function CloseButton($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["name"]);
  push();
  let name = fallback($$props["name"], "Close");
  ToolbarButton($$payload, spread_props([
    { name },
    $$restProps,
    {
      class: twMerge("ms-auto", $$sanitized_props.class),
      children: invalid_default_snippet,
      $$slots: {
        default: ($$payload2, { svgSize }) => {
          $$payload2.out += `<svg${attr("class", clsx(svgSize))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`;
        }
      }
    }
  ]));
  bind_props($$props, { name });
  pop();
}
function BottomNav($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "activeUrl",
    "position",
    "navType",
    "outerClass",
    "innerClass",
    "activeClass",
    "classActive",
    "classOuter",
    "classInner"
  ]);
  push();
  let outerCls, innerCls;
  let activeUrl = fallback($$props["activeUrl"], "");
  let position = fallback($$props["position"], "fixed");
  let navType = fallback($$props["navType"], "default");
  let outerClass = fallback($$props["outerClass"], "w-full z-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600");
  let innerClass = fallback($$props["innerClass"], "grid h-full max-w-lg mx-auto");
  let activeClass = fallback($$props["activeClass"], "text-primary-700 dark:text-primary-700 hover:text-primary-900 dark:hover:text-primary-900");
  let classActive = fallback($$props["classActive"], "");
  let classOuter = fallback($$props["classOuter"], "");
  let classInner = fallback($$props["classInner"], "");
  let activeCls = "";
  const activeUrlStore = writable("");
  activeCls = twMerge(activeClass, classActive);
  setContext("navType", navType);
  setContext("bottomNavType", { activeClass: activeCls });
  setContext("activeUrl", activeUrlStore);
  const outerDivClasses = {
    default: "bottom-0 start-0 h-16 bg-white border-t",
    border: "bottom-0 start-0 h-16 bg-white border-t",
    application: "h-16 max-w-lg -translate-x-1/2 rtl:translate-x-1/2 bg-white border rounded-full bottom-4 start-1/2",
    pagination: "bottom-0 h-16 -translate-x-1/2 rtl:translate-x-1/2 bg-white border-t start-1/2",
    group: "bottom-0 -translate-x-1/2 rtl:translate-x-1/2 bg-white border-t start-1/2",
    card: "bottom-0 start-0 h-16 bg-white border-t",
    meeting: "bottom-0 start-0 grid h-16 grid-cols-1 px-8 bg-white border-t md:grid-cols-3",
    video: "bottom-0 start-0 grid h-24 grid-cols-1 px-8 bg-white border-t md:grid-cols-3"
  };
  const innerDivClasses = {
    default: "",
    border: "",
    application: "",
    pagination: "",
    group: "",
    card: "",
    meeting: "flex items-center justify-center mx-auto",
    video: "flex items-center w-full"
  };
  {
    activeUrlStore.set(activeUrl);
  }
  outerCls = twMerge(position, outerClass, outerDivClasses[navType], classOuter);
  innerCls = twMerge(innerClass, innerDivClasses[navType], classInner);
  $$payload.out += `<div${spread_attributes({ ...$$restProps, class: clsx(outerCls) })}><!---->`;
  slot($$payload, $$props, "header", {}, null);
  $$payload.out += `<!----> <div${attr("class", clsx(innerCls))}><!---->`;
  slot($$payload, $$props, "default", {}, null);
  $$payload.out += `<!----></div></div>`;
  bind_props($$props, {
    activeUrl,
    position,
    navType,
    outerClass,
    innerClass,
    activeClass,
    classActive,
    classOuter,
    classInner
  });
  pop();
}
function BottomNavItem($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "btnName",
    "appBtnPosition",
    "activeClass",
    "href",
    "exact",
    "spanClass"
  ]);
  push();
  let active;
  let btnName = fallback($$props["btnName"], "");
  let appBtnPosition = fallback($$props["appBtnPosition"], "middle");
  let activeClass = fallback($$props["activeClass"], () => undefined, true);
  let href = fallback($$props["href"], "");
  let exact = fallback($$props["exact"], true);
  let spanClass = fallback($$props["spanClass"], "");
  const navType = getContext("navType");
  const context = getContext("bottomNavType") ?? {};
  const activeUrlStore = getContext("activeUrl");
  let navUrl = "";
  activeUrlStore.subscribe((value) => {
    navUrl = value;
  });
  const btnClasses = {
    default: "inline-flex flex-col items-center justify-center px-5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 group",
    border: "inline-flex flex-col items-center justify-center px-5 border-gray-200 border-x text-gray-500 dark:text-gray-400  hover:bg-gray-50 dark:hover:bg-gray-800 group dark:border-gray-600",
    application: "",
    pagination: "inline-flex flex-col items-center justify-center px-5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 group",
    group: "inline-flex flex-col items-center justify-center p-4 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 group",
    card: "inline-flex flex-col items-center justify-center px-5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 group",
    meeting: "",
    video: ""
  };
  const spanClasses = {
    default: "text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500",
    border: "text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500",
    application: "sr-only",
    pagination: "sr-only",
    group: "sr-only",
    card: "text-sm text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500",
    meeting: "",
    video: ""
  };
  const appBtnClasses = {
    left: "inline-flex flex-col items-center justify-center px-5 rounded-s-full hover:bg-gray-50 dark:hover:bg-gray-800 group",
    middle: "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group",
    right: "inline-flex flex-col items-center justify-center px-5 rounded-e-full hover:bg-gray-50 dark:hover:bg-gray-800 group"
  };
  let btnClass;
  let spanCls;
  active = navUrl && exact ? href === navUrl : navUrl ? navUrl.startsWith(href) : false;
  btnClass = twMerge(btnClasses[navType], appBtnClasses[appBtnPosition], active && (activeClass ?? context.activeClass), $$sanitized_props.btnClass);
  spanCls = twMerge(spanClasses[navType], active && (activeClass ?? context.activeClass), spanClass);
  element(
    $$payload,
    href ? "a" : "button",
    () => {
      $$payload.out += `${spread_attributes({
        "aria-label": btnName,
        href,
        role: href ? "link" : "button",
        ...$$restProps,
        class: clsx(btnClass)
      })}`;
    },
    () => {
      $$payload.out += `<!---->`;
      slot($$payload, $$props, "default", {}, null);
      $$payload.out += `<!----> <span${attr("class", clsx(spanCls))}>${escape_html(btnName)}</span>`;
    }
  );
  bind_props($$props, {
    btnName,
    appBtnPosition,
    activeClass,
    href,
    exact,
    spanClass
  });
  pop();
}
function Popper($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "activeContent",
    "arrow",
    "offset",
    "placement",
    "trigger",
    "triggeredBy",
    "reference",
    "strategy",
    "open",
    "yOnly",
    "middlewares"
  ]);
  push();
  let middleware;
  let activeContent = fallback($$props["activeContent"], false);
  let arrow = fallback($$props["arrow"], true);
  let offset$1 = fallback($$props["offset"], 8);
  let placement = fallback($$props["placement"], "top");
  let trigger = fallback($$props["trigger"], "hover");
  let triggeredBy = fallback($$props["triggeredBy"], () => undefined, true);
  let reference = fallback($$props["reference"], () => undefined, true);
  let strategy = fallback($$props["strategy"], "absolute");
  let open = fallback($$props["open"], false);
  let yOnly = fallback($$props["yOnly"], false);
  let middlewares = fallback($$props["middlewares"], () => [flip(), shift()], true);
  let referenceEl;
  let floatingEl;
  let arrowEl;
  const px = (n) => n ? `${n}px` : "";
  let arrowSide;
  const oppositeSideMap = {
    left: "right",
    right: "left",
    bottom: "top",
    top: "bottom"
  };
  function updatePosition() {
    computePosition(referenceEl, floatingEl, { placement, strategy, middleware }).then(({
      x,
      y,
      middlewareData,
      placement: placement2,
      strategy: strategy2
    }) => {
      floatingEl.style.position = strategy2;
      floatingEl.style.left = yOnly ? "0" : px(x);
      floatingEl.style.top = px(y);
      if (middlewareData.arrow && arrowEl instanceof HTMLDivElement) {
        arrowEl.style.left = px(middlewareData.arrow.x);
        arrowEl.style.top = px(middlewareData.arrow.y);
        arrowSide = oppositeSideMap[placement2.split("-")[0]];
        arrowEl.style[arrowSide] = px(-arrowEl.offsetWidth / 2 - ($$sanitized_props.border ? 1 : 0));
      }
    });
  }
  function init(node, _referenceEl) {
    floatingEl = node;
    let cleanup = autoUpdate(_referenceEl, floatingEl, updatePosition);
    return {
      update(_referenceEl2) {
        cleanup();
        cleanup = autoUpdate(_referenceEl2, floatingEl, updatePosition);
      },
      destroy() {
        cleanup();
      }
    };
  }
  let arrowClass;
  placement && (referenceEl = referenceEl);
  middleware = [
    ...middlewares,
    offset(+offset$1),
    arrowEl
  ];
  arrowClass = twJoin("absolute pointer-events-none block w-[10px] h-[10px] rotate-45 bg-inherit border-inherit", $$sanitized_props.border && arrowSide === "bottom" && "border-b border-e", $$sanitized_props.border && arrowSide === "top" && "border-t border-s ", $$sanitized_props.border && arrowSide === "right" && "border-t border-e ", $$sanitized_props.border && arrowSide === "left" && "border-b border-s ");
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (!referenceEl) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<div></div>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--> `;
    if (referenceEl) {
      $$payload2.out += "<!--[-->";
      Frame($$payload2, spread_props([
        {
          use: init,
          options: referenceEl,
          role: "tooltip",
          tabindex: activeContent ? -1 : undefined
        },
        $$restProps,
        {
          get open() {
            return open;
          },
          set open($$value) {
            open = $$value;
            $$settled = false;
          },
          children: ($$payload3) => {
            $$payload3.out += `<!---->`;
            slot($$payload3, $$props, "default", {}, null);
            $$payload3.out += `<!----> `;
            if (arrow) {
              $$payload3.out += "<!--[-->";
              $$payload3.out += `<div${attr("class", clsx(arrowClass))}></div>`;
            } else {
              $$payload3.out += "<!--[!-->";
            }
            $$payload3.out += `<!--]-->`;
          },
          $$slots: { default: true }
        }
      ]));
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]-->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, {
    activeContent,
    arrow,
    offset: offset$1,
    placement,
    trigger,
    triggeredBy,
    reference,
    strategy,
    open,
    yOnly,
    middlewares
  });
  pop();
}
function Range($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["value", "size"]);
  push();
  let value = fallback($$props["value"], 0);
  let size = fallback($$props["size"], "md");
  const sizes = {
    sm: "h-1 range-sm",
    md: "h-2",
    lg: "h-3 range-lg"
  };
  let inputClass;
  inputClass = twMerge("w-full bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700", sizes[size] ?? sizes.md, $$sanitized_props.class);
  $$payload.out += `<input${spread_attributes({
    type: "range",
    value,
    ...$$restProps,
    class: clsx(inputClass)
  })}>`;
  bind_props($$props, { value, size });
  pop();
}
function Modal($$payload, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "open",
    "title",
    "size",
    "color",
    "placement",
    "autoclose",
    "outsideclose",
    "dismissable",
    "backdropClass",
    "classBackdrop",
    "dialogClass",
    "classDialog",
    "defaultClass",
    "headerClass",
    "classHeader",
    "bodyClass",
    "classBody",
    "footerClass",
    "classFooter"
  ]);
  push();
  let backdropCls, dialogCls, frameCls, headerCls, bodyCls, footerCls;
  let open = fallback($$props["open"], false);
  let title = fallback($$props["title"], "");
  let size = fallback($$props["size"], "md");
  let color = fallback($$props["color"], "default");
  let placement = fallback($$props["placement"], "center");
  let autoclose = fallback($$props["autoclose"], false);
  let outsideclose = fallback($$props["outsideclose"], false);
  let dismissable = fallback($$props["dismissable"], true);
  let backdropClass = fallback($$props["backdropClass"], "fixed inset-0 z-40 bg-gray-900 bg-opacity-50 dark:bg-opacity-80");
  let classBackdrop = fallback($$props["classBackdrop"], () => undefined, true);
  let dialogClass = fallback($$props["dialogClass"], "fixed top-0 start-0 end-0 h-modal md:inset-0 md:h-full z-50 w-full p-4 flex");
  let classDialog = fallback($$props["classDialog"], () => undefined, true);
  let defaultClass = fallback($$props["defaultClass"], "relative flex flex-col mx-auto");
  let headerClass = fallback($$props["headerClass"], "flex justify-between items-center p-4 md:p-5 rounded-t-lg");
  let classHeader = fallback($$props["classHeader"], () => undefined, true);
  let bodyClass = fallback($$props["bodyClass"], "p-4 md:p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain");
  let classBody = fallback($$props["classBody"], () => undefined, true);
  let footerClass = fallback($$props["footerClass"], "flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse rounded-b-lg");
  let classFooter = fallback($$props["classFooter"], () => undefined, true);
  const getPlacementClasses = (placement2) => {
    switch (placement2) {
      case "top-left":
        return ["justify-start", "items-start"];
      case "top-center":
        return ["justify-center", "items-start"];
      case "top-right":
        return ["justify-end", "items-start"];
      case "center-left":
        return ["justify-start", "items-center"];
      case "center":
        return ["justify-center", "items-center"];
      case "center-right":
        return ["justify-end", "items-center"];
      case "bottom-left":
        return ["justify-start", "items-end"];
      case "bottom-center":
        return ["justify-center", "items-end"];
      case "bottom-right":
        return ["justify-end", "items-end"];
      default:
        return ["justify-center", "items-center"];
    }
  };
  const sizes = {
    xs: "max-w-md",
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-7xl"
  };
  backdropCls = twMerge(backdropClass, classBackdrop);
  dialogCls = twMerge(dialogClass, classDialog, getPlacementClasses(placement));
  frameCls = twMerge(defaultClass, "w-full divide-y", $$sanitized_props.class);
  headerCls = twMerge(headerClass, classHeader);
  bodyCls = twMerge(bodyClass, classBody);
  footerCls = twMerge(footerClass, classFooter);
  if (open) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div${attr("class", clsx(backdropCls))}></div>  <div${attr("class", clsx(dialogCls))} tabindex="-1" aria-modal="true" role="dialog"><div${attr("class", `flex relative ${stringify(sizes[size])} w-full max-h-full`)}>`;
    Frame($$payload, spread_props([
      { rounded: true, shadow: true },
      $$restProps,
      {
        class: frameCls,
        color,
        children: ($$payload2) => {
          if ($$slots.header || title) {
            $$payload2.out += "<!--[-->";
            Frame($$payload2, {
              class: headerCls,
              color,
              children: ($$payload3) => {
                $$payload3.out += `<!---->`;
                slot($$payload3, $$props, "header", {}, () => {
                  $$payload3.out += `<h3${attr("class", `text-xl font-semibold ${stringify(color === "default" ? "" : "text-gray-900 dark:text-white")} p-0`)}>${escape_html(title)}</h3>`;
                });
                $$payload3.out += `<!----> `;
                if (dismissable) {
                  $$payload3.out += "<!--[-->";
                  CloseButton($$payload3, { name: "Close modal", color });
                } else {
                  $$payload3.out += "<!--[!-->";
                }
                $$payload3.out += `<!--]-->`;
              },
              $$slots: { default: true }
            });
          } else {
            $$payload2.out += "<!--[!-->";
          }
          $$payload2.out += `<!--]--> <div${attr("class", clsx(bodyCls))} role="document">`;
          if (dismissable && !$$slots.header && !title) {
            $$payload2.out += "<!--[-->";
            CloseButton($$payload2, {
              name: "Close modal",
              class: "absolute top-3 end-2.5",
              color
            });
          } else {
            $$payload2.out += "<!--[!-->";
          }
          $$payload2.out += `<!--]--> <!---->`;
          slot($$payload2, $$props, "default", {}, null);
          $$payload2.out += `<!----></div> `;
          if ($$slots.footer) {
            $$payload2.out += "<!--[-->";
            Frame($$payload2, {
              class: footerCls,
              color,
              children: ($$payload3) => {
                $$payload3.out += `<!---->`;
                slot($$payload3, $$props, "footer", {}, null);
                $$payload3.out += `<!---->`;
              },
              $$slots: { default: true }
            });
          } else {
            $$payload2.out += "<!--[!-->";
          }
          $$payload2.out += `<!--]-->`;
        },
        $$slots: { default: true }
      }
    ]));
    $$payload.out += `<!----></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, {
    open,
    title,
    size,
    color,
    placement,
    autoclose,
    outsideclose,
    dismissable,
    backdropClass,
    classBackdrop,
    dialogClass,
    classDialog,
    defaultClass,
    headerClass,
    classHeader,
    bodyClass,
    classBody,
    footerClass,
    classFooter
  });
  pop();
}
function Popover($$payload, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["title", "defaultClass"]);
  push();
  let title = fallback($$props["title"], "");
  let defaultClass = fallback($$props["defaultClass"], "py-2 px-3");
  Popper($$payload, spread_props([
    {
      activeContent: true,
      border: true,
      shadow: true,
      rounded: true
    },
    $$restProps,
    {
      class: `dark:!border-gray-600 ${stringify($$sanitized_props.class)}`,
      children: ($$payload2) => {
        if ($$slots.title || title) {
          $$payload2.out += "<!--[-->";
          $$payload2.out += `<div class="py-2 px-3 bg-gray-100 rounded-t-md border-b border-gray-200 dark:border-gray-600 dark:bg-gray-700"><!---->`;
          slot($$payload2, $$props, "title", {}, () => {
            $$payload2.out += `<h3 class="font-semibold text-gray-900 dark:text-white">${escape_html(title)}</h3>`;
          });
          $$payload2.out += `<!----></div>`;
        } else {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]--> <div${attr("class", clsx(defaultClass))}><!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!----></div>`;
      },
      $$slots: { default: true }
    }
  ]));
  bind_props($$props, { title, defaultClass });
  pop();
}
function Tooltip($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["type", "defaultClass"]);
  push();
  let type = fallback($$props["type"], "dark");
  let defaultClass = fallback($$props["defaultClass"], "py-2 px-3 text-sm font-medium");
  const types = {
    dark: "bg-gray-900 text-white dark:bg-gray-700",
    light: "border-gray-200 bg-white text-gray-900",
    auto: " bg-white text-gray-900 dark:bg-gray-700 dark:text-white border-gray-200 dark:border-gray-700",
    custom: ""
  };
  let toolTipClass;
  {
    if ($$restProps.color) type = "custom";
    else $$restProps.color = "none";
    if (["light", "auto"].includes(type)) $$restProps.border = true;
    toolTipClass = twMerge("tooltip", defaultClass, types[type], $$sanitized_props.class);
  }
  Popper($$payload, spread_props([
    { rounded: true, shadow: true },
    $$restProps,
    {
      class: toolTipClass,
      children: ($$payload2) => {
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {}, null);
        $$payload2.out += `<!---->`;
      },
      $$slots: { default: true }
    }
  ]));
  bind_props($$props, { type, defaultClass });
  pop();
}
function UnitPropagationComponent($$payload, $$props) {
  push();
  let { assignment: assignment2, isLast } = $$props;
  let buttonId = "btn-" + nanoid();
  const problem = getProblemStore();
  const propagatedClause = (() => {
    if (assignment2.isUP()) {
      const reason = assignment2.getReason();
      if (isUnitPropagationReason(reason)) {
        return problem.clauses.get(reason.clauseId);
      } else {
        logFatal("Reason error", "The reason is not a backtracking");
      }
    } else {
      logFatal("Reason error", "The variable assignment is not a backtracking");
    }
  })();
  const conflictClauseId = propagatedClause.getId();
  const conflictClauseString = propagatedClause.map((literal) => {
    return literal.toTeX();
  }).join("\\: \\:");
  const inspectedVariable2 = getInspectedVariable();
  $$payload.out += `<unit-propagation><button${attr("id", buttonId)}${attr("class", `literal-style decision unit-propagation ${stringify("pad-others")} ${stringify([
    assignment2.variableId() === inspectedVariable2 && isLast ? "inspecting" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  MathTexComponent($$payload, { equation: assignment2.toTeX() });
  $$payload.out += `<!----></button></unit-propagation> `;
  Popover($$payload, {
    triggeredBy: "#" + buttonId,
    class: "app-popover",
    trigger: "click",
    placement: "bottom",
    children: ($$payload2) => {
      $$payload2.out += `<div class="popover-content"><span class="clause-id">${escape_html(conflictClauseId)}.</span> `;
      MathTexComponent($$payload2, {
        equation: conflictClauseString,
        fontSize: "var(--popover-font-size)"
      });
      $$payload2.out += `<!----></div>`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  pop();
}
function ChildlessDecisionComponent($$payload, $$props) {
  push();
  let { assignment: assignment2, isLast } = $$props;
  const inspectedVariable2 = getInspectedVariable();
  $$payload.out += `<childless-decision><button${attr("class", `literal-style decision level-expanded childless ${stringify("pad-others")} svelte-1f4b2m1 ${stringify([
    assignment2.variableId() === inspectedVariable2 && isLast ? "inspecting" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  MathTexComponent($$payload, { equation: assignment2.toTeX() });
  $$payload.out += `<!----></button></childless-decision>`;
  pop();
}
function DecisionComponent($$payload, $$props) {
  push();
  let { assignment: assignment2, isLast, expanded } = $$props;
  const inspectedVariable2 = getInspectedVariable();
  $$payload.out += `<decision><button${attr("class", `literal-style decision ${stringify("pad-others")} svelte-4sb3ns ${stringify([
    expanded ? "level-expanded" : "",
    assignment2.variableId() === inspectedVariable2 && isLast ? "inspecting" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  MathTexComponent($$payload, { equation: assignment2.toTeX() });
  $$payload.out += `<!----></button></decision>`;
  pop();
}
function DecisionLevelComponent($$payload, $$props) {
  push();
  let {
    decision,
    expanded,
    propagations = [],
    isLast
  } = $$props;
  if (propagations?.length === 0) {
    $$payload.out += "<!--[-->";
    ChildlessDecisionComponent($$payload, { assignment: decision, isLast });
  } else {
    $$payload.out += "<!--[!-->";
    DecisionComponent($$payload, { expanded, assignment: decision, isLast });
    $$payload.out += `<!----> `;
    if (expanded) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(propagations);
      $$payload.out += `<!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let assignment2 = each_array[$$index];
        if (assignment2.isK()) {
          $$payload.out += "<!--[-->";
          BacktrackingComponent($$payload, { assignment: assignment2, isLast });
        } else {
          $$payload.out += "<!--[!-->";
          UnitPropagationComponent($$payload, { assignment: assignment2, isLast });
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]-->`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function createEventBus() {
  let subscribers = [];
  return {
    subscribe(fn) {
      subscribers.push(fn);
      return () => {
        subscribers = subscribers.filter((sub) => sub !== fn);
      };
    },
    emit(event) {
      subscribers.forEach((fn) => fn(event));
    }
  };
}
const openSettingsViewEventBus = createEventBus();
const closeSettingsViewEventBus = createEventBus();
const userActionEventBus = createEventBus();
const stateMachineEventBus = createEventBus();
function TrailComponent($$payload, $$props) {
  push();
  let { trail, expanded, isLast = true } = $$props;
  let initialPropagations = trail.getInitialPropagations();
  let decisions = trail.getDecisions().map((a, idx) => {
    return { assignment: a, level: idx + 1 };
  });
  const each_array = ensure_array_like(initialPropagations);
  const each_array_1 = ensure_array_like(decisions);
  $$payload.out += `<trail class="trail svelte-198x4bn"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let assignment2 = each_array[$$index];
    if (assignment2.isK()) {
      $$payload.out += "<!--[-->";
      BacktrackingComponent($$payload, { assignment: assignment2, isLast });
    } else {
      $$payload.out += "<!--[!-->";
      UnitPropagationComponent($$payload, { assignment: assignment2, isLast });
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--> <!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let { level, assignment: assignment2 } = each_array_1[$$index_1];
    DecisionLevelComponent($$payload, {
      decision: assignment2,
      propagations: trail.getPropagations(level),
      expanded,
      isLast
    });
  }
  $$payload.out += `<!--]--></trail>`;
  pop();
}
const SAT_STATE_ID = 999;
const UNSAT_STATE_ID = 666;
const DECIDE_STATE_ID = 333;
const BACKTRACKING_STATE_ID = 444;
const MIN_DELAY_MS = 100;
let stepDelay = MIN_DELAY_MS;
const getStepDelay = () => stepDelay;
class SolverMachine {
  //With the exclamation mark, we assure that the stateMachine attribute will be assigned before its use
  stateMachine;
  runningOnAuto = false;
  forcedStop = false;
  constructor(stateMachine) {
    this.stateMachine = stateMachine;
    this.runningOnAuto = false;
    this.forcedStop = false;
  }
  isInAutoMode() {
    return this.runningOnAuto;
  }
  getActiveStateId() {
    return this.stateMachine.getActiveId();
  }
  updateActiveStateId(id) {
    this.stateMachine.setActiveId(id);
  }
  completed() {
    return this.stateMachine.onFinalState();
  }
  onConflictState() {
    return this.stateMachine.onConflictState();
  }
  onUnsatState() {
    return this.stateMachine.onUnsatState();
  }
  onFinalState() {
    return this.stateMachine.onFinalState();
  }
  onInitialState() {
    return this.stateMachine.onInitialState();
  }
  stopAutoMode() {
    this.forcedStop = true;
  }
  async transition(input) {
    if (input === "step") {
      this.step();
    } else if (input === "nextVariable") {
      await this.solveToNextVariableStepByStep();
    } else if (input === "finishUP") {
      await this.solveUPStepByStep();
    } else if (input === "solve_trail") {
      await this.solveTrailStepByStep();
    } else if (input === "solve_all") {
      await this.solveAllStepByStep();
    } else {
      logFatal("Non expected input Solver State Machine");
    }
  }
  async stepByStep(continueCond) {
    if (!this.assertPreAuto()) {
      return;
    }
    this.setFlagsPreAuto();
    const times = [];
    while (continueCond() && !this.forcedStop) {
      this.step();
      await tick();
      await new Promise((r) => times.push(setTimeout(r, getStepDelay())));
    }
    times.forEach(clearTimeout);
    this.setFlagsPostAuto();
  }
  async solveAllStepByStep() {
    this.stepByStep(() => !this.completed());
  }
  async solveTrailStepByStep() {
    this.stepByStep(() => !this.onConflictState() && !this.completed());
  }
  setFlagsPreAuto() {
    this.forcedStop = false;
    this.runningOnAuto = true;
  }
  setFlagsPostAuto() {
    this.runningOnAuto = false;
  }
  assertPreAuto() {
    let assert = true;
    if (this.isInAutoMode()) {
      logWarning("Solver machine", "Solver is already running on auto");
      assert = false;
    }
    if (this.stateMachine.onFinalState()) {
      this.runningOnAuto = false;
      logWarning("Solver machine", "Solver is already completed");
      assert = false;
    }
    return assert;
  }
}
class Trail {
  assignments = [];
  decisionLevelBookmark = [-1];
  learned = [];
  followUPIndex = -1;
  decisionLevel = 0;
  trailCapacity = 0;
  trailEnding = -1;
  constructor(trailCapacity = 0) {
    this.trailCapacity = trailCapacity;
  }
  copy() {
    const newTrail = new Trail(this.trailCapacity);
    newTrail.assignments = this.assignments.map((assignment2) => assignment2.copy());
    newTrail.decisionLevelBookmark = [...this.decisionLevelBookmark];
    newTrail.learned = this.learned.map((clause) => clause);
    newTrail.followUPIndex = this.followUPIndex;
    newTrail.decisionLevel = this.decisionLevel;
    newTrail.trailCapacity = this.trailCapacity;
    newTrail.trailEnding = this.trailEnding;
    return newTrail;
  }
  getDecisionLevel() {
    return this.decisionLevel;
  }
  getAssignments() {
    return [...this.assignments];
  }
  getDecisions() {
    return this.getDecisionLevelMarks().map((mark) => this.assignments[mark]);
  }
  getInitialPropagations() {
    return this.getPropagations(0);
  }
  getPropagations(level) {
    if (level === 0) {
      return this.getLevelZeroPropagations();
    } else {
      return this.getLevelPropagations(level);
    }
  }
  getTrailEnding() {
    return this.trailEnding;
  }
  updateTrailEnding(clauseId = -1) {
    this.trailEnding = clauseId;
  }
  hasPropagations(level) {
    return this.getPropagations(level).length > 0;
  }
  push(assignment2) {
    if (this.assignments.length == this.trailCapacity) logFatal("skipped allocating assignment as trail capacity is fulfilled");
    else {
      this.assignments.push(assignment2);
      if (assignment2.isD()) {
        this.registerNewDecisionLevel();
      }
    }
  }
  pop() {
    const returnValue = this.assignments.pop();
    if (returnValue?.isD()) {
      this.deleteCurrentDecisionLevel();
    }
    return returnValue;
  }
  learnedClauses() {
    return this.learned;
  }
  learn(clause) {
    this.learned.push(clause);
  }
  updateFollowUpIndex() {
    this.followUPIndex = this.assignments.length - 1;
  }
  [Symbol.iterator]() {
    return this.assignments.values();
  }
  forEach(callback, thisArg) {
    this.assignments.forEach(callback, thisArg);
  }
  getLevelZeroPropagations() {
    const startMark = 0;
    let endMark = this.assignments.length;
    if (this.hasDecisions()) {
      endMark = this.getMarkOfDecisionLevel(1);
    }
    return this.assignments.slice(startMark, endMark);
  }
  getLevelPropagations(level) {
    const startMark = this.getMarkOfDecisionLevel(level);
    let endMark;
    if (this.decisionLevelExists(level + 1)) {
      endMark = this.getMarkOfDecisionLevel(level + 1);
    } else {
      endMark = this.assignments.length;
    }
    return this.assignments.slice(startMark + 1, endMark);
  }
  registerNewDecisionLevel() {
    const nextDecisionLevel = this.decisionLevel + 1;
    if (this.decisionLevelExists(nextDecisionLevel)) {
      logFatal(`Trying to save an existing decision level ${nextDecisionLevel}`);
    }
    this.decisionLevel = nextDecisionLevel;
    const decisionMark = this.assignments.length - 1;
    this.decisionLevelBookmark.push(decisionMark);
  }
  deleteCurrentDecisionLevel() {
    if (!this.decisionLevelExists(this.decisionLevel)) {
      logFatal(`Trying to delete current decision level but was not saved`);
    }
    this.decisionLevelBookmark = this.decisionLevelBookmark.slice(0, -1);
    this.decisionLevel = this.decisionLevel - 1;
  }
  decisionLevelExists(level) {
    const levels = this.getDecisionLevelMarks();
    return level > 0 && level <= levels.length;
  }
  getMarkOfDecisionLevel(level) {
    if (!this.decisionLevelExists(level)) {
      logFatal(`Level ${level} does not exist`);
    }
    const levels = this.getDecisionLevelMarks();
    return levels[level - 1];
  }
  getDecisionLevelMarks() {
    return this.decisionLevelBookmark.slice(1);
  }
  hasDecisions() {
    const levels = this.getDecisionLevelMarks();
    return levels.length > 0;
  }
}
let noDecisions = 0;
let noConflicts = 0;
let noUnitPropagations = 0;
let clausesLeft = {};
const increaseNoDecisions = () => {
  noDecisions += 1;
};
const increaseNoConflicts = () => {
  noConflicts += 1;
};
const updateClausesLeft = (nTrail) => {
  const nClauses = getProblemStore().clauses.leftToSatisfy();
  clausesLeft[nTrail] = nClauses;
};
const getNoDecisions = () => noDecisions;
const getNoConflicts = () => noConflicts;
const getNoUnitPropagations = () => noUnitPropagations;
const getClausesLeft = () => clausesLeft;
let stack = [
  {
    snapshot: [],
    activeState: 0,
    statistics: {
      noDecisions: 0,
      noConflicts: 0,
      noUnitPropagations: 0,
      clausesLeft: {}
    }
  }
];
let stackPointer = 0;
function getSnapshot() {
  return stack[stackPointer];
}
const getStackPointer = () => stackPointer;
const getStackLength = () => stack.length;
let trails = getSnapshot().snapshot;
const getLatestTrail = () => trails[trails.length - 1];
const stackTrail = (trail) => {
  trails = [...trails, trail];
};
const unstackTrail = () => {
  trails = trails.slice(0, length - 1);
};
const getTrails = () => trails;
const updateLastTrailEnding = (clauseId) => {
  trails[trails.length - 1].updateTrailEnding(clauseId);
};
const initialTransition = (solver) => {
  const stateMachine = solver.stateMachine;
  ecTransition(stateMachine);
  if (stateMachine.onFinalState()) return;
  allVariablesAssignedTransition(stateMachine);
};
const analyzeClause = (solver) => {
  const stateMachine = solver.stateMachine;
  const pendingConflict = solver.consultConflict();
  const pendingClauses = pendingConflict.clauses;
  const clauseId = nextClauseTransition(stateMachine, pendingClauses);
  const conflict2 = conflictDetectionTransition(stateMachine, clauseId);
  if (conflict2) {
    updateLastTrailEnding(clauseId);
    emptyPendingSetTransition(stateMachine, solver);
    decisionLevelTransition(stateMachine);
    return;
  }
  deleteClauseTransition(stateMachine, pendingClauses, clauseId);
  const allChecked = allClausesCheckedTransition(stateMachine, pendingClauses);
  if (!allChecked) return;
  updateClausesToCheck(/* @__PURE__ */ new Set(), -1);
  allVariablesAssignedTransition(stateMachine);
};
const decide$2 = (solver) => {
  const stateMachine = solver.stateMachine;
  const literalToPropagate = decideTransition(stateMachine);
  const complementaryClauses = complementaryOccurrencesTransition(stateMachine, literalToPropagate);
  conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};
const backtracking$2 = (solver) => {
  const stateMachine = solver.stateMachine;
  const literalToPropagate = backtrackingTransition(stateMachine);
  const complementaryClauses = complementaryOccurrencesTransition(stateMachine, literalToPropagate);
  conflictDetectionBlock(solver, stateMachine, Math.abs(literalToPropagate), complementaryClauses);
};
const conflictDetectionBlock = (solver, stateMachine, variable, complementaryClauses) => {
  const triggeredClauses2 = triggeredClausesTransition(stateMachine, complementaryClauses);
  if (!triggeredClauses2) {
    allVariablesAssignedTransition(stateMachine);
    return;
  }
  queueClauseSetTransition(stateMachine, solver, variable, complementaryClauses);
  const pendingSet = pickPendingSetTransition(stateMachine, solver);
  const allChecked = allClausesCheckedTransition(stateMachine, pendingSet);
  if (allChecked) {
    logFatal("This is not a possibility in this case");
  }
};
const ecTransition = (stateMachine) => {
  if (stateMachine.getActiveId() !== 0) {
    logFatal("Fail Initial", "Trying to use initialTransition in a state that is not the initial one");
  }
  const ecState = stateMachine.getActiveState();
  if (ecState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Empty Clause state");
  }
  const result = ecState.run();
  if (result) stateMachine.transition("unsat_state");
  else stateMachine.transition("all_variables_assigned_state");
};
const allVariablesAssignedTransition = (stateMachine) => {
  const allVariablesAssignedState = stateMachine.getActiveState();
  if (allVariablesAssignedState.run === undefined) {
    logFatal("Function call error", "There should be a function in the All Variables Assigned state");
  }
  const result = allVariablesAssignedState.run();
  if (result) stateMachine.transition("sat_state");
  else stateMachine.transition("decide_state");
};
const nextClauseTransition = (stateMachine, pendingSet) => {
  const nextCluaseState = stateMachine.getActiveState();
  if (nextCluaseState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Next Clause state");
  }
  const clauseId = nextCluaseState.run(pendingSet);
  incrementCheckingIndex();
  stateMachine.transition("conflict_detection_state");
  return clauseId;
};
const conflictDetectionTransition = (stateMachine, clauseId) => {
  const conflictDetectionState = stateMachine.getActiveState();
  if (conflictDetectionState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Conflict Detection state");
  }
  const result = conflictDetectionState.run(clauseId);
  if (result) stateMachine.transition("empty_pending_set_state");
  else stateMachine.transition("delete_clause_state");
  return result;
};
const emptyPendingSetTransition = (stateMachine, solver) => {
  const emptyClauseSetState = stateMachine.getActiveState();
  if (emptyClauseSetState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Empty Clause Set state");
  }
  emptyClauseSetState.run(solver);
  stateMachine.transition("decision_level_state");
};
const decisionLevelTransition = (stateMachine) => {
  const decisionLevelState = stateMachine.getActiveState();
  if (decisionLevelState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Decision Level state");
  }
  const result = decisionLevelState.run();
  if (result) stateMachine.transition("unsat_state");
  else stateMachine.transition("backtracking_state");
};
const deleteClauseTransition = (stateMachine, pendingSet, clauseId) => {
  const deleteClauseState = stateMachine.getActiveState();
  if (deleteClauseState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Delete Clause state");
  }
  deleteClauseState.run(pendingSet, clauseId);
  stateMachine.transition("all_clauses_checked_state");
};
const allClausesCheckedTransition = (stateMachine, pendingSet) => {
  const allClausesCheckedState = stateMachine.getActiveState();
  if (allClausesCheckedState.run === undefined) {
    logFatal("Function call error", "There should be a function in the All Clausees Checked state");
  }
  const result = allClausesCheckedState.run(pendingSet);
  if (result) stateMachine.transition("all_variables_assigned_state");
  else stateMachine.transition("next_clause_state");
  return result;
};
const decideTransition = (stateMachine) => {
  const decideState = stateMachine.getActiveState();
  if (decideState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Decide state");
  }
  const literalToPropagate = decideState.run();
  stateMachine.transition("complementary_occurrences_state");
  return literalToPropagate;
};
const backtrackingTransition = (stateMachine) => {
  const backtrackingState = stateMachine.getActiveState();
  if (backtrackingState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Decide state");
  }
  const literalToPropagate = backtrackingState.run();
  stateMachine.transition("complementary_occurrences_state");
  return literalToPropagate;
};
const complementaryOccurrencesTransition = (stateMachine, literalToPropagate) => {
  const complementaryOccurrencesState = stateMachine.getActiveState();
  if (complementaryOccurrencesState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Complementary Occurrences state");
  }
  const clauses = complementaryOccurrencesState.run(literalToPropagate);
  stateMachine.transition("triggered_clauses_state");
  return clauses;
};
const triggeredClausesTransition = (stateMachine, complementaryClauses) => {
  const triggeredClausesState = stateMachine.getActiveState();
  if (triggeredClausesState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Triggered Clauses state");
  }
  const result = triggeredClausesState.run(complementaryClauses);
  if (result) stateMachine.transition("queue_clause_set_state");
  else stateMachine.transition("all_variables_assigned_state");
  return result;
};
const queueClauseSetTransition = (stateMachine, solver, variable, clauseSet) => {
  const queueClauseSetState = stateMachine.getActiveState();
  if (queueClauseSetState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Queue Clause Set state");
  }
  queueClauseSetState.run(variable, clauseSet, solver);
  stateMachine.transition("pick_pending_set_state");
};
const pickPendingSetTransition = (stateMachine, solver) => {
  const pickClauseSetState = stateMachine.getActiveState();
  if (pickClauseSetState.run === undefined) {
    logFatal("Function call error", "There should be a function in the Peek Pending Set state");
  }
  const result = pickClauseSetState.run(solver);
  stateMachine.transition("all_clauses_checked_state");
  return result;
};
const MIN_DELAY = 1;
const MAX_DELAY = 10;
const STEP_DELAY = 0.5;
let baselineDelay = 3;
const getBaselineDelay = () => baselineDelay;
const DEFAULT_POLARITY = true;
let baselinePolarity = DEFAULT_POLARITY;
const getBaselinePolarity = () => baselinePolarity;
let assignment = {
  type: "automated",
  polarity: getBaselinePolarity()
};
const updateAssignment = (newType, newPolarity, newVariable) => {
  {
    if (newVariable === undefined || newPolarity === undefined) {
      logFatal("No variable | polarity found", "Variable && Polarity should be instantiated in a manual assignment");
    }
    assignment = {
      type: newType,
      variable: newVariable,
      polarity: newPolarity
    };
  }
};
const getAssignment = () => assignment;
const variableBreakpoint = new SvelteSet();
const markedAsBreakpoint = (assignment2) => {
  let checkVariableId = false;
  if (assignment2.type === "variable") {
    checkVariableId = variableBreakpoint.has(assignment2.id);
  } else {
    logError("Unsupported assignment type:", assignment2.type);
  }
  return checkVariableId;
};
const getBreakpoints = () => variableBreakpoint;
const isUnSAT = (e) => {
  return e.type === "UnSAT";
};
const emptyClauseDetection$1 = (pool) => {
  const evaluation = pool.eval();
  return isUnSAT(evaluation);
};
const allAssigned$1 = (pool) => {
  return pool.allAssigned();
};
const decide$1 = (pool, algorithm) => {
  const trail = obtainTrail(pool);
  const assignmentEvent = getAssignment();
  let manualAssignment = false;
  let variableId;
  if (assignmentEvent.type === "automated") {
    const nextVariable = pool.nextVariableToAssign();
    if (!isJust(nextVariable)) {
      logFatal("Decision Node", "No variable to decide");
    }
    variableId = fromJust(nextVariable);
  } else {
    manualAssignment = true;
    variableId = assignmentEvent.variable;
  }
  doAssignment(variableId, assignmentEvent.polarity);
  const variable = pool.getCopy(variableId);
  if (manualAssignment) {
    trail.push(VariableAssignment.newManualAssignment(variable));
  } else {
    trail.push(VariableAssignment.newAutomatedAssignment(variable, algorithm));
  }
  increaseNoDecisions();
  stackTrail(trail);
  return assignmentEvent.polarity ? variableId : -variableId;
};
const clauseEvaluation = (pool, clauseId) => {
  const clause = pool.get(clauseId);
  const evaluation = clause.eval();
  return evaluation;
};
const triggeredClauses$1 = (clauses) => {
  return clauses.size !== 0;
};
const obtainTrail = (variables) => {
  const trail = getLatestTrail() ?? new Trail(variables.nVariables());
  unstackTrail();
  return trail;
};
const complementaryOccurrences$1 = (mapping, literal) => {
  const mappingReturn = mapping.get(-literal);
  const complementaryOccurrences2 = /* @__PURE__ */ new Set();
  if (mappingReturn !== undefined) {
    for (const clause of mappingReturn) {
      complementaryOccurrences2.add(clause);
    }
  }
  return complementaryOccurrences2;
};
const nonDecisionMade$1 = () => {
  const trail = getLatestTrail();
  return trail.getDecisionLevel() === 0;
};
const doAssignment = (variableId, polarity) => {
  const { variables } = getProblemStore();
  variables.persist(variableId, polarity);
  const assignment2 = { type: "variable", id: variableId };
  afterAssignment(assignment2);
};
const afterAssignment = (assignment2) => {
  const solverMachine2 = getSolverMachine();
  const runningInAutoMode = solverMachine2.isInAutoMode();
  const isBreakpoint = markedAsBreakpoint(assignment2);
  if (isBreakpoint) {
    logBreakpoint("Variable breakpoint", `Variable ${assignment2.id} assigned`);
  }
  if (runningInAutoMode && isBreakpoint) {
    solverMachine2.stopAutoMode();
  }
  updateClausesLeft(getTrails().length);
};
const backtracking$1 = (pool) => {
  const trail = getLatestTrail().copy();
  trail.updateTrailEnding();
  const lastVariableAssignment = disposeUntilDecision(trail, pool);
  const lastVariable = lastVariableAssignment.getVariable();
  const polarity = !lastVariable.getAssignment();
  pool.dispose(lastVariable.getInt());
  doAssignment(lastVariable.getInt(), polarity);
  const variable = pool.getCopy(lastVariable.getInt());
  trail.push(VariableAssignment.newBacktrackingAssignment(variable));
  trail.updateFollowUpIndex();
  increaseNoConflicts();
  stackTrail(trail);
  return polarity ? lastVariable.getInt() : -lastVariable.getInt();
};
const disposeUntilDecision = (trail, variables) => {
  let last = trail.pop();
  while (last && !last.isD()) {
    variables.dispose(last.getVariable().getInt());
    last = trail.pop();
  }
  if (!last) {
    throw logFatal("No backtracking was made", "There was no decision left to backtrack");
  }
  return last;
};
const emptyClauseDetection = () => {
  const pool = getProblemStore().clauses;
  return emptyClauseDetection$1(pool);
};
const allAssigned = () => {
  const pool = getProblemStore().variables;
  return allAssigned$1(pool);
};
const decide = () => {
  const pool = getProblemStore().variables;
  return decide$1(pool, "backtracking");
};
const complementaryOccurrences = (literal) => {
  const mapping = getProblemStore().mapping;
  return complementaryOccurrences$1(mapping, literal);
};
const triggeredClauses = (clauses) => {
  return triggeredClauses$1(clauses);
};
const queueClauseSet = (variable, clauses, solverStateMachine) => {
  if (clauses.size === 0) {
    logFatal("Empty set of clauses are not thought to be queued");
  }
  solverStateMachine.setConflict({ clauses, variableReasonId: variable });
};
const pickPendingSet = (solverStateMachine) => {
  const { clauses, variableReasonId } = solverStateMachine.consultConflict();
  updateClausesToCheck(clauses, variableReasonId);
  return clauses;
};
const allClausesChecked = (pendingSet) => {
  return pendingSet.size === 0;
};
const nextClause = (pendingSet) => {
  if (pendingSet.size === 0) {
    logFatal("A non empty set was expected");
  }
  const clausesIterator = pendingSet.values().next();
  const clauseId = clausesIterator.value;
  return clauseId;
};
const unsatisfiedClause = (clauseId) => {
  const pool = getProblemStore().clauses;
  const evaluation = clauseEvaluation(pool, clauseId);
  return isUnSATClause(evaluation);
};
const deleteClause = (pending, clauseId) => {
  if (!pending.has(clauseId)) {
    logFatal("Clause not found", `Clause - ${clauseId} not found`);
  }
  pending.delete(clauseId);
};
const emptyClauseSet = (solverStateMachine) => {
  solverStateMachine.resolveConflict();
  updateClausesToCheck(/* @__PURE__ */ new Set(), -1);
};
const nonDecisionMade = () => {
  return nonDecisionMade$1();
};
const backtracking = () => {
  const pool = getProblemStore().variables;
  return backtracking$1(pool);
};
const bkt_stateName2StateId = {
  sat_state: SAT_STATE_ID,
  unsat_state: UNSAT_STATE_ID,
  decide_state: DECIDE_STATE_ID,
  backtracking_state: BACKTRACKING_STATE_ID,
  empty_clause_state: 0,
  all_variables_assigned_state: 1,
  complementary_occurrences_state: 2,
  triggered_clauses_state: 3,
  queue_clause_set_state: 4,
  pick_pending_set_state: 5,
  all_clauses_checked_state: 6,
  next_clause_state: 7,
  conflict_detection_state: 8,
  delete_clause_state: 9,
  empty_pending_set_state: 10,
  decision_level_state: 11
};
const unsat_state = {
  id: bkt_stateName2StateId["unsat_state"],
  description: "UnSAT state"
};
const sat_state = {
  id: bkt_stateName2StateId["sat_state"],
  description: "SAT state"
};
const empty_clause_state = {
  id: bkt_stateName2StateId["empty_clause_state"],
  run: emptyClauseDetection,
  description: "Seeks for the empty clause in the clause pool",
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("all_variables_assigned_state", bkt_stateName2StateId["all_variables_assigned_state"]).set("unsat_state", bkt_stateName2StateId["unsat_state"])
};
const all_variables_assigned_state = {
  id: bkt_stateName2StateId["all_variables_assigned_state"],
  description: "Verify if all variables have been assigned",
  run: allAssigned,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("sat_state", bkt_stateName2StateId["sat_state"]).set("decide_state", bkt_stateName2StateId["decide_state"])
};
const decide_state = {
  id: bkt_stateName2StateId["decide_state"],
  description: "Executes a decide step",
  run: decide,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("complementary_occurrences_state", bkt_stateName2StateId["complementary_occurrences_state"])
};
const complementary_occurrences_state = {
  id: bkt_stateName2StateId["complementary_occurrences_state"],
  run: complementaryOccurrences,
  description: "Get the clauses where the complementary of the last assigned literal appear",
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("triggered_clauses_state", bkt_stateName2StateId["triggered_clauses_state"])
};
const triggered_clauses_state = {
  id: bkt_stateName2StateId["triggered_clauses_state"],
  run: triggeredClauses,
  description: "Checks if last assignment added clauses to revise",
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("queue_clause_set_state", bkt_stateName2StateId["queue_clause_set_state"]).set("all_variables_assigned_state", bkt_stateName2StateId["all_variables_assigned_state"])
};
const queue_clause_set_state = {
  id: bkt_stateName2StateId["queue_clause_set_state"],
  run: queueClauseSet,
  description: "Stack a set of clause as pending",
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("pick_pending_set_state", bkt_stateName2StateId["pick_pending_set_state"])
};
const pick_clause_set_state = {
  id: bkt_stateName2StateId["pick_pending_set_state"],
  description: "Get next pending clause set from the queue",
  run: pickPendingSet,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("all_clauses_checked_state", bkt_stateName2StateId["all_clauses_checked_state"])
};
const all_clauses_checked_state = {
  id: bkt_stateName2StateId["all_clauses_checked_state"],
  description: "True if the postponed set of clauses still contain clauses to check, otherwise false",
  run: allClausesChecked,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("next_clause_state", bkt_stateName2StateId["next_clause_state"]).set("all_variables_assigned_state", bkt_stateName2StateId["all_variables_assigned_state"])
};
const next_clause_state = {
  id: bkt_stateName2StateId["next_clause_state"],
  description: "Returns the next clause to deal with",
  run: nextClause,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("conflict_detection_state", bkt_stateName2StateId["conflict_detection_state"])
};
const conflict_detection_state = {
  id: bkt_stateName2StateId["conflict_detection_state"],
  run: unsatisfiedClause,
  description: "Check if current clause is unsatisfied",
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("delete_clause_state", bkt_stateName2StateId["delete_clause_state"]).set("empty_pending_set_state", bkt_stateName2StateId["empty_pending_set_state"])
};
const delete_clause_state = {
  id: bkt_stateName2StateId["delete_clause_state"],
  run: deleteClause,
  description: `Deletes the clause that has been analyzed`,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("all_clauses_checked_state", bkt_stateName2StateId["all_clauses_checked_state"])
};
const empty_pending_set_state = {
  id: bkt_stateName2StateId["empty_pending_set_state"],
  run: emptyClauseSet,
  description: `Emties the queue of clauses to check`,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("decision_level_state", bkt_stateName2StateId["decision_level_state"])
};
const decision_level_state = {
  id: bkt_stateName2StateId["decision_level_state"],
  run: nonDecisionMade,
  description: `Check if decision level of the latest trail is === 0`,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("backtracking_state", bkt_stateName2StateId["backtracking_state"]).set("unsat_state", bkt_stateName2StateId["unsat_state"])
};
const backtracking_state = {
  id: bkt_stateName2StateId["backtracking_state"],
  run: backtracking,
  description: `Executes a backtracking step`,
  transitions: /* @__PURE__ */ (/* @__PURE__ */ new Map()).set("complementary_occurrences_state", bkt_stateName2StateId["complementary_occurrences_state"])
};
const states = /* @__PURE__ */ new Map();
states.set(empty_clause_state.id, empty_clause_state);
states.set(all_variables_assigned_state.id, all_variables_assigned_state);
states.set(decide_state.id, decide_state);
states.set(complementary_occurrences_state.id, complementary_occurrences_state);
states.set(triggered_clauses_state.id, triggered_clauses_state);
states.set(queue_clause_set_state.id, queue_clause_set_state);
states.set(pick_clause_set_state.id, pick_clause_set_state);
states.set(conflict_detection_state.id, conflict_detection_state);
states.set(all_clauses_checked_state.id, all_clauses_checked_state);
states.set(next_clause_state.id, next_clause_state);
states.set(delete_clause_state.id, delete_clause_state);
states.set(empty_pending_set_state.id, empty_pending_set_state);
states.set(decision_level_state.id, decision_level_state);
states.set(sat_state.id, sat_state);
states.set(unsat_state.id, unsat_state);
states.set(backtracking_state.id, backtracking_state);
const initial = empty_clause_state.id;
const conflict = backtracking_state.id;
const sat = sat_state.id;
const unsat = unsat_state.id;
const isFinalState = (state) => {
  return !("transitions" in state);
};
class StateMachine {
  states;
  active = -1;
  initial = -1;
  conflict = -1;
  sat = -1;
  unsat = -1;
  constructor(states2, initial2, conflict2, sat2, unsat2) {
    this.states = states2;
    this.initial = initial2;
    this.active = initial2;
    this.conflict = conflict2;
    this.sat = sat2;
    this.unsat = unsat2;
  }
  onFinalState() {
    const activeState = this.getActiveState();
    return isFinalState(activeState);
  }
  onInitialState() {
    return this.getActiveState().id === this.initial;
  }
  onConflictState() {
    return this.getActiveState().id === this.conflict;
  }
  onUnsatState() {
    return this.getActiveState().id === UNSAT_STATE_ID;
  }
  getActiveState() {
    const activeState = this.states.get(this.active);
    if (activeState === undefined) {
      logFatal("Error evaluating state machine", "Active state not found to know if it is completed");
    }
    return activeState;
  }
  getActiveId() {
    return this.active;
  }
  setActiveId(id) {
    this.active = id;
  }
  getNextState(input) {
    if (this.onFinalState()) {
      logFatal("No next state for a completed state machine");
    } else {
      const activeState = this.getActiveState();
      const activeStateTransitions = activeState.transitions;
      const nextStateId = activeStateTransitions.get(input);
      if (nextStateId === undefined) {
        logFatal("Unexpected input to active state");
      } else {
        const nextState = this.states.get(nextStateId);
        if (nextState === undefined) {
          logFatal("Next state does not appear in set of states by id");
        } else {
          return nextState;
        }
      }
    }
  }
  transition(input) {
    if (this.onFinalState()) {
      logFatal("Already in a final state");
    } else {
      const nextState = this.getNextState(input);
      this.active = nextState.id;
      if (this.onFinalState()) {
        this.notifyFinalState();
      }
    }
  }
  notifyFinalState() {
    console.log("notifiying final state");
    const stateId = this.getActiveState().id;
    if (stateId === this.sat) {
      logSAT("The problem has been satisfied");
    } else if (stateId === this.unsat) {
      logUnSAT("The problem is unsatisfiable");
    }
  }
}
const makeBKTMachine = () => {
  return new BKT_StateMachine(states, initial);
};
class BKT_StateMachine extends StateMachine {
  constructor(states2, initial2) {
    super(states2, initial2, conflict, sat, unsat);
  }
}
class BKT_SolverMachine extends SolverMachine {
  conflictAnalysis = undefined;
  constructor() {
    super(makeBKTMachine());
    this.conflictAnalysis = undefined;
  }
  resolveConflict() {
    this.conflictAnalysis = undefined;
  }
  setConflict(conflict2) {
    this.conflictAnalysis = conflict2;
  }
  visitClause(clauseId) {
    if (this.conflictAnalysis === undefined) {
      logFatal("Conflict analysis not initialized", "Error at visiting a clause in the BKT Solver Machine");
    }
    const { clauses } = this.conflictAnalysis;
    if (!clauses.has(clauseId)) {
      logFatal("Clause not found", "Error at removing a clause from the BKT Solver Machine");
    } else {
      clauses.delete(clauseId);
    }
  }
  consultConflict() {
    if (this.conflictAnalysis === undefined) {
      logFatal("Conflict analysis not initialized", "Error at consulting a conflict in the BKT Solver Machine");
    }
    return this.conflictAnalysis;
  }
  getRecord() {
    return { pending: this.makeConflictAnalysisCopy() };
  }
  makeConflictAnalysisCopy() {
    if (this.conflictAnalysis !== undefined) {
      const clauses = /* @__PURE__ */ new Set([...this.conflictAnalysis.clauses.values()]);
      const variableReasonId = this.conflictAnalysis.variableReasonId;
      return { clauses, variableReasonId };
    }
    return undefined;
  }
  // ** abstract functions **
  updateFromRecord(record) {
    if (record === undefined) {
      this.conflictAnalysis = undefined;
      updateClausesToCheck(/* @__PURE__ */ new Set(), -1);
      return;
    }
    const conflictRecord = record["pending"];
    this.setConflict(conflictRecord);
    if (this.onConflictDetection()) {
      const { clauses, variableReasonId } = conflictRecord;
      updateClausesToCheck(clauses, variableReasonId);
    }
  }
  step() {
    const activeId = this.stateMachine.getActiveId();
    if (activeId === bkt_stateName2StateId.empty_clause_state) {
      initialTransition(this);
    } else if (activeId === bkt_stateName2StateId.next_clause_state) {
      analyzeClause(this);
    } else if (activeId === bkt_stateName2StateId.decide_state) {
      decide$2(this);
    } else if (activeId === bkt_stateName2StateId.backtracking_state) {
      backtracking$2(this);
    }
  }
  async solveToNextVariableStepByStep() {
    this.stepByStep(() => this.onConflictDetection());
  }
  async solveUPStepByStep() {
    this.solveToNextVariableStepByStep();
  }
  onConflictDetection() {
    if (this.conflictAnalysis === undefined) {
      return false;
    } else {
      const { clauses } = this.conflictAnalysis;
      return clauses.size > 0;
    }
  }
}
let solverMachine = new BKT_SolverMachine();
const getSolverMachine = () => solverMachine;
function DynamicRender($$payload, $$props) {
  let component = $$props["component"];
  let props = fallback($$props["props"], () => ({}), true);
  if (component) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<!---->`;
    component?.($$payload, spread_props([props]));
    $$payload.out += `<!---->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { component, props });
}
function AdjustmentsVerticalOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "adjustments vertical outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round"${attr("stroke-width", strokeWidth)} d="M6 4v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2m6-16v2m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v10m6-16v10m0 0a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m0 0v2"></path></svg>`;
  pop();
}
function ArrowDownToBracketOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "arrow down to bracket outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2m-8 1V4m0 12-4-4m4 4 4-4"></path></svg>`;
  pop();
}
function ArrowRightOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "arrow right outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M19 12H5m14 0-4 4m4-4-4-4"></path></svg>`;
  pop();
}
function ArrowUpFromBracketOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "arrow up from bracket outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"></path></svg>`;
  pop();
}
function BarsOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "bars outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round"${attr("stroke-width", strokeWidth)} d="M5 7h14M5 12h14M5 17h14"></path></svg>`;
  pop();
}
function BookOpenOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "book open outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"></path></svg>`;
  pop();
}
function BugOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "bug outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M10 5 9 4V3m5 2 1-1V3m-3 6v11m0-11a5 5 0 0 1 5 5m-5-5a5 5 0 0 0-5 5m5-5a4.959 4.959 0 0 1 2.973 1H15V8a3 3 0 0 0-6 0v2h.027A4.959 4.959 0 0 1 12 9Zm-5 5H5m2 0v2a5 5 0 0 0 10 0v-2m2.025 0H17m-9.975 4H6a1 1 0 0 0-1 1v2m12-3h1.025a1 1 0 0 1 1 1v2M16 11h1a1 1 0 0 0 1-1V8m-9.975 3H7a1 1 0 0 1-1-1V8"></path></svg>`;
  pop();
}
function CaretRightOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "caret right outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M8 16.881V7.119a1 1 0 0 1 1.636-.772l5.927 4.881a1 1 0 0 1 0 1.544l-5.927 4.88A1 1 0 0 1 8 16.882Z"></path></svg>`;
  pop();
}
function CheckCircleOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "check circle outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;
  pop();
}
function CheckOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "check outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M5 11.917 9.724 16.5 19 7.5"></path></svg>`;
  pop();
}
function ChevronDoubleRightOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "chevron double right outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="m7 16 4-4-4-4m6 8 4-4-4-4"></path></svg>`;
  pop();
}
function ChevronLeftOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "chevron left outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="m14 8-4 4 4 4"></path></svg>`;
  pop();
}
function CircleMinusOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "circle minus outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;
  pop();
}
function CloseCircleOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "close circle outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;
  pop();
}
function CloseOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "close outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M6 18 17.94 6M18 18 6.06 6"></path></svg>`;
  pop();
}
function CodeMergeOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "code merge outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6-2a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm0 0h-1a5 5 0 0 1-5-5v-.5"></path></svg>`;
  pop();
}
function CodePullRequestOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "code pull request outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M6 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V9a3 3 0 0 0-3-3h-3m1.5-2-2 2 2 2"></path></svg>`;
  pop();
}
function CogOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "cog outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path></svg>`;
  pop();
}
function DatabaseOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "database outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M19 6c0 1.657-3.134 3-7 3S5 7.657 5 6m14 0c0-1.657-3.134-3-7-3S5 4.343 5 6m14 0v6M5 6v6m0 0c0 1.657 3.134 3 7 3s7-1.343 7-3M5 12v6c0 1.657 3.134 3 7 3s7-1.343 7-3v-6"></path></svg>`;
  pop();
}
function ExclamationCircleOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "exclamation circle outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path></svg>`;
  pop();
}
function FileCirclePlusOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "file circle plus outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M18 9V4a1 1 0 0 0-1-1H8.914a1 1 0 0 0-.707.293L4.293 7.207A1 1 0 0 0 4 7.914V20a1 1 0 0 0 1 1h4M9 3v4a1 1 0 0 1-1 1H4m11 6v4m-2-2h4m3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"></path></svg>`;
  pop();
}
function FlagOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "flag outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M5 14v7M5 4.971v9.541c5.6-5.538 8.4 2.64 14-.086v-9.54C13.4 7.61 10.6-.568 5 4.97Z"></path></svg>`;
  pop();
}
function ForwardOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "forward outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M4.248 19C3.22 15.77 5.275 8.232 12.466 8.232V6.079a1.025 1.025 0 0 1 1.644-.862l5.479 4.307a1.108 1.108 0 0 1 0 1.723l-5.48 4.307a1.026 1.026 0 0 1-1.643-.861v-2.154C5.275 13.616 4.248 19 4.248 19Z"></path></svg>`;
  pop();
}
function HammerOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "hammer outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="m20.9532 11.7634-2.0523-2.05225-2.0523 2.05225 2.0523 2.0523 2.0523-2.0523Zm-1.3681-2.73651-4.1046-4.10457L12.06 8.3428l4.1046 4.1046 3.4205-3.42051Zm-4.1047 2.73651-2.7363-2.73638-8.20919 8.20918 2.73639 2.7364 8.2091-8.2092Z"></path><path stroke="currentColor" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="m12.9306 3.74083 1.8658 1.86571-2.0523 2.05229-1.5548-1.55476c-.995-.99505-3.23389-.49753-3.91799.18657l2.73639-2.73639c.6841-.68409 1.9901-.74628 2.9229.18658Z"></path></svg>`;
  pop();
}
function LockOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "lock outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M12 14v3m-3-6V7a3 3 0 1 1 6 0v4m-8 0h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"></path></svg>`;
  pop();
}
function PenOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "pen outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"></path></svg>`;
  pop();
}
function PlusOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "plus outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M5 12h14m-7 7V5"></path></svg>`;
  pop();
}
function RefreshOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "refresh outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"></path></svg>`;
  pop();
}
function ReplyOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "reply outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"></path></svg>`;
  pop();
}
function StopOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "stop outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><rect width="12" height="12" x="6" y="6" stroke="currentColor" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} rx="1"></rect></svg>`;
  pop();
}
function TrashBinOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "trash bin outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge("shrink-0", sizes[size], className)),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : undefined,
      viewBox: "0 0 24 24"
    },
    undefined,
    undefined,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"></path></svg>`;
  pop();
}
function InformationComponent($$payload, $$props) {
  push();
  let { trail } = $$props;
  let buttonId = "btn-" + nanoid();
  const problem = getProblemStore();
  const iconProps = { class: "h-7 w-7 cursor-pointer" };
  const clauseId = trail.getTrailEnding();
  const clause = (() => {
    if (clauseId === -1) return undefined;
    const clause2 = problem.clauses.get(clauseId);
    return clause2.map((literal) => {
      return literal.toTeX();
    }).join("\\: \\:");
  })();
  const activeId = getSolverMachine().getActiveStateId();
  const satState = activeId === SAT_STATE_ID;
  const unsatState = activeId === UNSAT_STATE_ID;
  $$payload.out += `<button${attr("id", buttonId)}${attr("class", `notification svelte-1j8dfhm ${stringify([
    clause !== undefined ? "conflict" : "",
    unsatState ? "unsat" : "",
    satState && clause === undefined ? "sat" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  if (unsatState) {
    $$payload.out += "<!--[-->";
    DynamicRender($$payload, { component: CloseOutline, props: iconProps });
  } else {
    $$payload.out += "<!--[!-->";
    if (clause !== undefined) {
      $$payload.out += "<!--[-->";
      DynamicRender($$payload, { component: HammerOutline, props: iconProps });
    } else {
      $$payload.out += "<!--[!-->";
      if (satState) {
        $$payload.out += "<!--[-->";
        DynamicRender($$payload, { component: CheckOutline, props: iconProps });
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></button> `;
  Popover($$payload, {
    triggeredBy: "#" + buttonId,
    class: "app-popover",
    trigger: "click",
    placement: "bottom",
    children: ($$payload2) => {
      $$payload2.out += `<div class="popover-content"><span class="clause-id">${escape_html(clauseId)}.</span> `;
      MathTexComponent($$payload2, {
        equation: clause,
        fontSize: "var(--popover-font-size)"
      });
      $$payload2.out += `<!----></div>`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  pop();
}
function TrailEditorComponent($$payload, $$props) {
  push();
  let { trails: trails2 } = $$props;
  let indexes = (() => {
    return trails2.map((_, index) => index);
  })();
  let expandedTrails = true;
  const each_array = ensure_array_like(indexes);
  const each_array_1 = ensure_array_like(trails2);
  const each_array_2 = ensure_array_like(trails2);
  $$payload.out += `<trail-editor role="presentation" tabindex="-1"${attr("class", `svelte-14ru4ix ${stringify([""].filter(Boolean).join(" "))}`)}><editor-leaf class="svelte-14ru4ix"><editor-indexes class="enumerate svelte-14ru4ix"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let index = each_array[$$index];
    $$payload.out += `<div class="item svelte-14ru4ix"><div class="enumerate-item svelte-14ru4ix"><span class="svelte-14ru4ix">${escape_html(index + 1)}.</span></div></div>`;
  }
  $$payload.out += `<!--]--></editor-indexes> <trails-leaf class="svelte-14ru4ix"><editor-trails class="svelte-14ru4ix"><!--[-->`;
  for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
    let trail = each_array_1[index];
    TrailComponent($$payload, {
      trail,
      expanded: expandedTrails,
      isLast: trails2.length === index + 1
    });
  }
  $$payload.out += `<!--]--></editor-trails></trails-leaf> <editor-info><!--[-->`;
  for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
    let trail = each_array_2[index];
    $$payload.out += `<div class="item svelte-14ru4ix">`;
    InformationComponent($$payload, { trail });
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--></editor-info></editor-leaf></trail-editor>`;
  pop();
}
function AppComponent($$payload, $$props) {
  push();
  let trails2 = getTrails();
  TrailEditorComponent($$payload, { trails: trails2 });
  pop();
}
function AutomaticDebuggerComponent($$payload, $$props) {
  push();
  let {
    backtrackingState,
    finished,
    cdMode: upMode,
    nextVariable
  } = $$props;
  const assignmentProps = { size: "md" };
  $$payload.out += `<automatic-debugger class="svelte-yce5ay"><div class="join-variable svelte-yce5ay">`;
  if (nextVariable) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="next-variable svelte-yce5ay"><span>${escape_html(nextVariable)}</span></div>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div${attr("class", `next-variable svelte-yce5ay ${stringify([backtrackingState ? "conflict" : ""].filter(Boolean).join(" "))}`)}><span>X</span></div>`;
  }
  $$payload.out += `<!--]--> `;
  if (!backtrackingState) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<button${attr("class", `btn general-btn next-button svelte-yce5ay ${stringify([finished || upMode ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Decide"${attr("disabled", finished || upMode, true)}>`;
    DynamicRender($$payload, {
      component: CaretRightOutline,
      props: assignmentProps
    });
    $$payload.out += `<!----></button>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<button${attr("class", `btn general-btn bkt-btn next-button svelte-yce5ay ${stringify([finished || upMode ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Backtrack"${attr("disabled", finished || upMode, true)}>`;
    DynamicRender($$payload, {
      component: CodeMergeOutline,
      props: assignmentProps
    });
    $$payload.out += `<!----></button>`;
  }
  $$payload.out += `<!--]--></div></automatic-debugger>`;
  pop();
}
function AutoModeComponent($$payload, $$props) {
  push();
  let min = MIN_DELAY;
  let max = MAX_DELAY;
  let step = STEP_DELAY;
  let delay = getBaselineDelay();
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<auto-mode class="svelte-1qjmpqb"><button class="btn general-btn" title="Stop">`;
    DynamicRender($$payload2, { component: StopOutline, props: { size: "md" } });
    $$payload2.out += `<!----></button> <div class="range svelte-1qjmpqb">`;
    Range($$payload2, {
      id: "range-steps",
      min,
      max,
      step,
      size: "sm",
      get value() {
        return delay;
      },
      set value($$value) {
        delay = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></div></auto-mode>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function ConflictDetectionDebuggerComponent($$payload, $$props) {
  push();
  let { cdMode: upMode } = $$props;
  const assignmentProps = { size: "md" };
  $$payload.out += `<conflict-detection-debugger class="svelte-8chb3j"><button${attr("class", `btn general-btn ${stringify([!upMode ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Step"${attr("disabled", !upMode, true)}>`;
  DynamicRender($$payload, {
    component: CaretRightOutline,
    props: assignmentProps
  });
  $$payload.out += `<!----></button> <button${attr("class", `btn general-btn ${stringify([!upMode ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Next variable"${attr("disabled", !upMode, true)}>`;
  DynamicRender($$payload, {
    component: ForwardOutline,
    props: assignmentProps
  });
  $$payload.out += `<!----></button> <button${attr("class", `btn general-btn ${stringify([!upMode ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Finish UPs"${attr("disabled", !upMode, true)}>`;
  DynamicRender($$payload, {
    component: ChevronDoubleRightOutline,
    props: assignmentProps
  });
  $$payload.out += `<!----></button></conflict-detection-debugger>`;
  pop();
}
function GeneralDebuggerComponent($$payload, $$props) {
  push();
  let { finished, backtrackingState } = $$props;
  let textCollapse = "Collapse Propagations";
  let btnRedoActive = getStackPointer() < getStackLength() - 1;
  const generalProps = { size: "md" };
  const reverseProps = { class: "transform -scale-x-100", size: "md" };
  onDestroy(() => {
  });
  $$payload.out += `<general-debugger class="svelte-vu1uhf"><button${attr("class", `btn general-btn ${stringify([
    finished || backtrackingState ? "invalidOption" : ""
  ].filter(Boolean).join(" "))}`)} title="Solve trail"${attr("disabled", finished || backtrackingState, true)}>`;
  DynamicRender($$payload, {
    component: ArrowRightOutline,
    props: generalProps
  });
  $$payload.out += `<!----></button> <button${attr("class", `btn general-btn ${stringify([
    finished || backtrackingState ? "invalidOption" : ""
  ].filter(Boolean).join(" "))}`)} title="Solve"${attr("disabled", finished || backtrackingState, true)}>`;
  DynamicRender($$payload, { component: BarsOutline, props: generalProps });
  $$payload.out += `<!----></button> <button${attr("class", `btn general-btn ${stringify(["invalidOption"].filter(Boolean).join(" "))}`)} title="Undo"${attr("disabled", true, true)}>`;
  DynamicRender($$payload, { component: ReplyOutline, props: generalProps });
  $$payload.out += `<!----></button> <button${attr("class", `btn general-btn ${stringify([!btnRedoActive ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Redo"${attr("disabled", !btnRedoActive, true)}>`;
  DynamicRender($$payload, { component: ReplyOutline, props: reverseProps });
  $$payload.out += `<!----></button> <button class="btn general-btn"${attr("title", textCollapse)}>`;
  DynamicRender($$payload, {
    component: ChevronLeftOutline,
    props: generalProps
  });
  $$payload.out += `<!----></button></general-debugger>`;
  pop();
}
function InitialStepDebuggerComponent($$payload, $$props) {
  push();
  const assignmentProps = { size: "md" };
  $$payload.out += `<init-step><button class="btn general-btn" title="Step">`;
  DynamicRender($$payload, {
    component: CaretRightOutline,
    props: assignmentProps
  });
  $$payload.out += `<!----></button></init-step>`;
  pop();
}
function ManualDebuggerComponent($$payload, $$props) {
  push();
  let {
    defaultNextVariable,
    finished,
    cdMode,
    backtrackingState
  } = $$props;
  const generalProps = { size: "md" };
  const problem = getProblemStore();
  let manualDecisionModal = false;
  let polarity = true;
  let maxValue = problem.variables.nVariables();
  let userNextVariable = defaultNextVariable;
  let isVariableValid = (() => {
    if (userNextVariable === undefined) return false;
    else {
      if (userNextVariable < 1 || userNextVariable > maxValue) return false;
      else {
        const assignedVariables = problem.variables.assignedVariables();
        return !assignedVariables.includes(userNextVariable);
      }
    }
  })();
  function emitAssignment() {
    if (!isVariableValid) {
      logInfo("Invalid Variable", "The variable you are trying to assign is already assigned");
    } else {
      updateAssignment("manual", polarity, userNextVariable);
      stateMachineEventBus.emit("step");
      userActionEventBus.emit("record");
      resetState();
    }
  }
  function resetState() {
    userNextVariable = undefined;
    polarity = true;
  }
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<manual-debugger class="svelte-1wijg3r"><button${attr("class", `btn general-btn ${stringify([
      defaultNextVariable === undefined || finished || cdMode || backtrackingState ? "invalidOption" : ""
    ].filter(Boolean).join(" "))}`)} title="Manual Decision"${attr("disabled", defaultNextVariable === undefined || finished || cdMode || backtrackingState, true)}>`;
    DynamicRender($$payload2, { component: PenOutline, props: generalProps });
    $$payload2.out += `<!----></button> `;
    Modal($$payload2, {
      size: "xs",
      outsideclose: true,
      class: "manual-decision",
      get open() {
        return manualDecisionModal;
      },
      set open($$value) {
        manualDecisionModal = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<div class="flex items-center gap-2"><span>Variable:</span> <input${attr("value", userNextVariable)}${attr("placeholder", defaultNextVariable ? defaultNextVariable.toString() : "X")} type="number"${attr("class", `variable-selector w-[128px] ${stringify([!isVariableValid ? "invalidOption" : ""].filter(Boolean).join(" "))}`)}${attr("disabled", defaultNextVariable === undefined, true)} min="1"${attr("max", maxValue)}></div> <div class="flex gap-2"><button${attr("class", `polarity ${stringify([polarity ? "active" : ""].filter(Boolean).join(" "))}`)}${attr("disabled", defaultNextVariable === undefined, true)} title="Set true">`;
        DynamicRender($$payload3, {
          component: CheckCircleOutline,
          props: generalProps
        });
        $$payload3.out += `<!----></button> <button${attr("class", `polarity ${stringify([!polarity ? "active" : ""].filter(Boolean).join(" "))}`)}${attr("disabled", defaultNextVariable === undefined, true)} title="Set false">`;
        DynamicRender($$payload3, {
          component: CircleMinusOutline,
          props: generalProps
        });
        $$payload3.out += `<!----></button></div> <div class="flex justify-end"><button${attr("class", `btn manual-button ${stringify([!isVariableValid ? "invalidOption" : ""].filter(Boolean).join(" "))}`)} title="Decide">`;
        DynamicRender($$payload3, {
          component: CaretRightOutline,
          props: generalProps
        });
        $$payload3.out += `<!----></button></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></manual-debugger>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  bind_props($$props, { emitAssignment });
  pop();
}
function claims2html(claims) {
  const items = claims.flatMap(claimToHtml);
  return items;
}
const clauseToHtml = (clause) => {
  return `<p class="clause">` + clause.map((lit) => {
    return `<span class="${lit === 0 ? "delimiter" : "literal"}">${lit}</span>`;
  }).join("") + `</p>`;
};
const commentToHtml = (comment) => {
  const trimmed = comment.trim();
  if (trimmed.length === 0 || trimmed === "%c") {
    return makeNothing();
  } else {
    return makeJust(`<p class="comment">% ` + trimmed.slice(2) + `</p>`);
  }
};
const claimToHtml = (claim) => {
  const { comments, clause } = claim;
  const htmlComments = comments.map(commentToHtml).filter(isJust).map(fromJust);
  const eos = clause[clause.length - 1];
  if (eos !== 0) {
    logFatal("Claim end of sequence not found");
  }
  const htmlClause = clauseToHtml(clause);
  return [...htmlComments, htmlClause];
};
const isTautology = (clause) => {
  let tautology = false;
  for (const lit of clause) {
    if (clause.has(lit * -1)) {
      tautology = true;
      break;
    }
  }
  return tautology;
};
const isRight = (e) => {
  return e.right !== undefined;
};
const makeLeft = (value) => ({ left: value });
const makeRight = (value) => ({ right: value });
const unwrapEither = ({ left, right }) => {
  if (right !== undefined && left !== undefined) {
    throw new Error(
      `Received both left and right values at runtime when opening an Either
Left: ${JSON.stringify(
        left
      )}
Right: ${JSON.stringify(right)}`
    );
  }
  if (left !== undefined) {
    return left;
  }
  if (right !== undefined) {
    return right;
  }
  throw new Error(`Received no left or right values at runtime when opening Either`);
};
const emptySummary = () => {
  const summary2 = {
    name: "",
    description: "",
    varCount: -1,
    clauseCount: -1,
    claims: [],
    cnf: [],
    nTautology: 0,
    nClauseSimplified: 0
  };
  return summary2;
};
function content2summary(input) {
  const { content: content2, name } = input;
  let lines = content2.trim().split("\n");
  const summary2 = emptySummary();
  summary2.name = name;
  const { description, endLine } = parseDescription(lines);
  summary2.description = description;
  lines = lines.slice(endLine);
  const eitherSummary = parseSummary(lines);
  if (isRight(eitherSummary)) {
    const { varCount, clauseCount, endLine: endLine2 } = unwrapEither(eitherSummary);
    summary2.varCount = varCount;
    summary2.clauseCount = clauseCount;
    lines = lines.slice(endLine2);
  } else {
    logFatal("Problem parsing summary", unwrapEither(eitherSummary));
  }
  const eitherClaims = parseClaims(lines, summary2.clauseCount);
  if (isRight(eitherClaims)) {
    const { claims, endLine: endLine2 } = unwrapEither(eitherClaims);
    summary2.claims = claims;
    lines = lines.slice(endLine2 + 1);
  } else {
    logFatal("Problem parsing claims", unwrapEither(eitherClaims));
  }
  const eitherClauses = makeClauses(
    summary2.claims,
    summary2.varCount
  );
  if (isRight(eitherClauses)) {
    const { clauses, nClauseSimplified, nTautology } = unwrapEither(eitherClauses);
    summary2.cnf = clauses;
    summary2.nTautology = nTautology;
    summary2.nClauseSimplified = nClauseSimplified;
  } else {
    const description2 = unwrapEither(eitherClauses);
    logFatal("Problem simplifying claims to clauses", description2);
  }
  return summary2;
}
function parseDescription(lines) {
  const description = [];
  let endLine = 0;
  let scape = false;
  while (!scape && endLine < lines.length) {
    const line = lines[endLine];
    if (line.at(0) === "p") {
      scape = true;
    } else {
      description.push(line);
      endLine += 1;
    }
  }
  return {
    description: description.join("\n"),
    endLine
  };
}
function parseSummary(lines) {
  if (lines.length == 0) {
    return makeLeft("could not parser summary because lines are empty");
  }
  const summary2 = lines[0];
  const chunkSummary = summary2.split(" ");
  if (chunkSummary.length !== 4) {
    return makeLeft(`summary should have four entries`);
  }
  const [p, cnf, vars, clauses] = chunkSummary;
  if (p !== "p") {
    return makeLeft(`symbol '${p}', expected 'p'`);
  }
  if (cnf !== "cnf") {
    return makeLeft(`boolean formula expected to be represented in Conjunctive Normal From (CNF)`);
  }
  const varCount = parseInt(vars);
  if (Number.isNaN(varCount)) {
    return makeLeft(`could not parse expected variable count to number representation of ${vars}`);
  }
  const clauseCount = parseInt(clauses);
  if (Number.isNaN(clauseCount)) {
    return makeLeft(
      `could not parse expected clauses count to number representation of ${clauses}`
    );
  }
  return makeRight({
    varCount,
    clauseCount,
    endLine: 1
  });
}
function isLineComment(line) {
  return line.at(0) === "c";
}
function parseClaims(lines, clauseCount) {
  const nClauses = lines.filter((line) => !isLineComment(line)).length;
  if (nClauses !== clauseCount) {
    return makeLeft(`Number of clauses found ${nClauses} and it was expected to be ${clauseCount}`);
  }
  const claims = [];
  let c = 0;
  let i = 0;
  while (c < clauseCount) {
    const comments = [];
    while (isLineComment(lines[i])) {
      comments.push(lines[i]);
      i += 1;
    }
    const clause = lines[i].trim().split(" ").map((lit) => parseInt(lit));
    claims.push({ comments, clause });
    c += 1;
    i += 1;
  }
  return makeRight({ claims, endLine: i });
}
function makeClauses(claims, varCount) {
  const rawClauses = claims.map((claim) => claim.clause);
  const asserts = rawClauses.map((rawClause, idx) => {
    const [eos, ...literals] = [...rawClause].reverse();
    if (eos !== 0) {
      return makeJust(`Clause with no EOS '0' at ${idx}`);
    } else if (literals.some((l) => Math.abs(l) > varCount)) {
      return makeJust(`Literal at claim ${idx} out of range`);
    } else {
      return makeNothing();
    }
  });
  const firstError = asserts.find((c) => isJust(c));
  if (firstError) {
    return makeLeft(fromJust(firstError));
  } else {
    let nTautology = 0;
    let nClauseSimplified = 0;
    const clauses = rawClauses.map((clause) => clause.slice(0, -1)).filter((clause) => {
      const uniques = new Set(clause);
      if (isTautology(uniques)) {
        nTautology += 1;
        return false;
      }
      return true;
    }).map((clause) => {
      const uniques = new Set(clause);
      if (clause.length !== uniques.size) {
        nClauseSimplified += 1;
      }
      return uniques;
    }).map((clause) => [...Array.from(clause)]);
    return makeRight({
      clauses,
      nTautology,
      nClauseSimplified
    });
  }
}
const fileName$2 = "dummy.dimacs";
const content$2 = `
p cnf 3 2
c this is just a dummy example
1 2 -3 0
c this is added here
-2 3 0
`;
const summary$2 = content2summary({ content: content$2, name: fileName$2.toLowerCase() });
({
  name: fileName$2.toLowerCase(),
  content: content$2,
  summary: summary$2,
  html: claims2html(summary$2.claims)
});
const fileName$1 = `NQueens8.dimacs`;
const content$1 = `
p cnf 194 740
-66 -194 0
-66 -193 0
-59 -192 0
-59 -191 0
-58 190 0
-65 -190 0
-58 -189 0
-51 -188 0
-51 187 0
-60 -187 0
-50 -186 0
-50 185 0
-57 186 0
-57 -185 0
-64 -186 0
-64 -185 0
-50 -184 0
-43 -183 0
-43 -182 0
-43 181 0
-52 182 0
-52 -181 0
-61 -182 0
-61 -181 0
-42 180 0
-42 179 0
-49 -180 0
-49 179 0
-56 180 0
-56 -179 0
-63 -180 0
-63 -179 0
-42 -178 0
-35 -177 0
-35 176 0
-35 175 0
-44 -176 0
-44 175 0
-53 176 0
-53 -175 0
-62 -176 0
-62 -175 0
-34 -174 0
-34 -173 0
-34 172 0
-41 174 0
-41 173 0
-41 -172 0
-48 -174 0
-48 173 0
-48 -172 0
-55 174 0
-55 -173 0
-55 -172 0
-62 -174 0
-62 -173 0
-62 -172 0
-34 -171 0
-27 -170 0
-27 -169 0
-27 -168 0
-27 167 0
-36 169 0
-36 168 0
-36 -167 0
-45 -169 0
-45 168 0
-45 -167 0
-54 169 0
-54 -168 0
-54 -167 0
-63 -169 0
-63 -168 0
-63 -167 0
-26 166 0
-26 -165 0
-26 164 0
-33 -166 0
-33 -165 0
-33 164 0
-40 166 0
-40 165 0
-40 -164 0
-47 -166 0
-47 165 0
-47 -164 0
-54 166 0
-54 -165 0
-54 -164 0
-61 -166 0
-61 -165 0
-61 -164 0
-26 -163 0
-19 -162 0
-19 161 0
-19 -160 0
-19 159 0
-28 -161 0
-28 -160 0
-28 159 0
-37 161 0
-37 160 0
-37 -159 0
-46 -161 0
-46 160 0
-46 -159 0
-55 161 0
-55 -160 0
-55 -159 0
-64 -161 0
-64 -160 0
-64 -159 0
-18 -158 0
-18 157 0
-18 156 0
-25 158 0
-25 -157 0
-25 156 0
-32 -158 0
-32 -157 0
-32 156 0
-39 158 0
-39 157 0
-39 -156 0
-46 -158 0
-46 157 0
-46 -156 0
-53 158 0
-53 -157 0
-53 -156 0
-60 -158 0
-60 -157 0
-60 -156 0
-18 -155 0
-11 -154 0
-11 -153 0
-11 152 0
-11 151 0
-20 153 0
-20 -152 0
-20 151 0
-29 -153 0
-29 -152 0
-29 151 0
-38 153 0
-38 152 0
-38 -151 0
-47 -153 0
-47 152 0
-47 -151 0
-56 153 0
-56 -152 0
-56 -151 0
-65 -153 0
-65 -152 0
-65 -151 0
-10 150 0
-10 149 0
-10 148 0
-17 -150 0
-17 149 0
-17 148 0
-24 150 0
-24 -149 0
-24 148 0
-31 -150 0
-31 -149 0
-31 148 0
-38 150 0
-38 149 0
-38 -148 0
-45 -150 0
-45 149 0
-45 -148 0
-52 150 0
-52 -149 0
-52 -148 0
-59 -150 0
-59 -149 0
-59 -148 0
-10 -147 0
-9 -146 0
-9 145 0
-9 144 0
-16 146 0
-16 -145 0
-16 144 0
-23 -146 0
-23 -145 0
-23 144 0
-30 146 0
-30 145 0
-30 -144 0
-37 -146 0
-37 145 0
-37 -144 0
-44 146 0
-44 -145 0
-44 -144 0
-51 -146 0
-51 -145 0
-51 -144 0
-9 143 0
-18 -143 0
-8 142 0
-8 -141 0
-8 140 0
-15 -142 0
-15 -141 0
-15 140 0
-22 142 0
-22 141 0
-22 -140 0
-29 -142 0
-29 141 0
-29 -140 0
-36 142 0
-36 -141 0
-36 -140 0
-43 -142 0
-43 -141 0
-43 -140 0
-8 -139 0
-8 138 0
-17 139 0
-17 -138 0
-26 -139 0
-26 -138 0
-7 -137 0
-7 -136 0
-7 135 0
-14 137 0
-14 136 0
-14 -135 0
-21 -137 0
-21 136 0
-21 -135 0
-28 137 0
-28 -136 0
-28 -135 0
-35 -137 0
-35 -136 0
-35 -135 0
-7 134 0
-7 133 0
-16 -134 0
-16 133 0
-25 134 0
-25 -133 0
-34 -134 0
-34 -133 0
-6 132 0
-6 131 0
-13 -132 0
-13 131 0
-20 132 0
-20 -131 0
-27 -132 0
-27 -131 0
-6 -130 0
-6 -129 0
-6 128 0
-15 130 0
-15 129 0
-15 -128 0
-24 -130 0
-24 129 0
-24 -128 0
-33 130 0
-33 -129 0
-33 -128 0
-42 -130 0
-42 -129 0
-42 -128 0
-5 -127 0
-5 126 0
-12 127 0
-12 -126 0
-19 -127 0
-19 -126 0
-5 125 0
-5 -124 0
-5 123 0
-14 -125 0
-14 -124 0
-14 123 0
-23 125 0
-23 124 0
-23 -123 0
-32 -125 0
-32 124 0
-32 -123 0
-41 125 0
-41 -124 0
-41 -123 0
-50 -125 0
-50 -124 0
-50 -123 0
-4 122 0
-11 -122 0
-4 -121 0
-4 120 0
-4 119 0
-13 121 0
-13 -120 0
-13 119 0
-22 -121 0
-22 -120 0
-22 119 0
-31 121 0
-31 120 0
-31 -119 0
-40 -121 0
-40 120 0
-40 -119 0
-49 121 0
-49 -120 0
-49 -119 0
-58 -121 0
-58 -120 0
-58 -119 0
-3 -118 0
-3 117 0
-3 116 0
-3 115 0
-12 -117 0
-12 116 0
-12 115 0
-21 117 0
-21 -116 0
-21 115 0
-30 -117 0
-30 -116 0
-30 115 0
-39 117 0
-39 116 0
-39 -115 0
-48 -117 0
-48 116 0
-48 -115 0
-57 117 0
-57 -116 0
-57 -115 0
-66 -117 0
-66 -116 0
-66 -115 0
66 58 50 42 34 26 18 10 0
-10 114 0
-10 113 0
-10 112 0
-18 -114 0
-18 113 0
-18 112 0
-26 114 0
-26 -113 0
-26 112 0
-34 -114 0
-34 -113 0
-34 112 0
-42 114 0
-42 113 0
-42 -112 0
-50 -114 0
-50 113 0
-50 -112 0
-58 114 0
-58 -113 0
-58 -112 0
-66 -114 0
-66 -113 0
-66 -112 0
65 57 49 41 33 25 17 9 0
-9 111 0
-9 110 0
-9 109 0
-17 -111 0
-17 110 0
-17 109 0
-25 111 0
-25 -110 0
-25 109 0
-33 -111 0
-33 -110 0
-33 109 0
-41 111 0
-41 110 0
-41 -109 0
-49 -111 0
-49 110 0
-49 -109 0
-57 111 0
-57 -110 0
-57 -109 0
-65 -111 0
-65 -110 0
-65 -109 0
64 56 48 40 32 24 16 8 0
-8 108 0
-8 107 0
-8 106 0
-16 -108 0
-16 107 0
-16 106 0
-24 108 0
-24 -107 0
-24 106 0
-32 -108 0
-32 -107 0
-32 106 0
-40 108 0
-40 107 0
-40 -106 0
-48 -108 0
-48 107 0
-48 -106 0
-56 108 0
-56 -107 0
-56 -106 0
-64 -108 0
-64 -107 0
-64 -106 0
63 55 47 39 31 23 15 7 0
-7 105 0
-7 104 0
-7 103 0
-15 -105 0
-15 104 0
-15 103 0
-23 105 0
-23 -104 0
-23 103 0
-31 -105 0
-31 -104 0
-31 103 0
-39 105 0
-39 104 0
-39 -103 0
-47 -105 0
-47 104 0
-47 -103 0
-55 105 0
-55 -104 0
-55 -103 0
-63 -105 0
-63 -104 0
-63 -103 0
62 54 46 38 30 22 14 6 0
-6 102 0
-6 101 0
-6 100 0
-14 -102 0
-14 101 0
-14 100 0
-22 102 0
-22 -101 0
-22 100 0
-30 -102 0
-30 -101 0
-30 100 0
-38 102 0
-38 101 0
-38 -100 0
-46 -102 0
-46 101 0
-46 -100 0
-54 102 0
-54 -101 0
-54 -100 0
-62 -102 0
-62 -101 0
-62 -100 0
61 53 45 37 29 21 13 5 0
-5 99 0
-5 98 0
-5 97 0
-13 -99 0
-13 98 0
-13 97 0
-21 99 0
-21 -98 0
-21 97 0
-29 -99 0
-29 -98 0
-29 97 0
-37 99 0
-37 98 0
-37 -97 0
-45 -99 0
-45 98 0
-45 -97 0
-53 99 0
-53 -98 0
-53 -97 0
-61 -99 0
-61 -98 0
-61 -97 0
60 52 44 36 28 20 12 4 0
-4 96 0
-4 95 0
-4 94 0
-12 -96 0
-12 95 0
-12 94 0
-20 96 0
-20 -95 0
-20 94 0
-28 -96 0
-28 -95 0
-28 94 0
-36 96 0
-36 95 0
-36 -94 0
-44 -96 0
-44 95 0
-44 -94 0
-52 96 0
-52 -95 0
-52 -94 0
-60 -96 0
-60 -95 0
-60 -94 0
59 51 43 35 27 19 11 3 0
-3 93 0
-3 92 0
-3 91 0
-11 -93 0
-11 92 0
-11 91 0
-19 93 0
-19 -92 0
-19 91 0
-27 -93 0
-27 -92 0
-27 91 0
-35 93 0
-35 92 0
-35 -91 0
-43 -93 0
-43 92 0
-43 -91 0
-51 93 0
-51 -92 0
-51 -91 0
-59 -93 0
-59 -92 0
-59 -91 0
-66 90 0
-66 89 0
-66 88 0
-65 -90 0
-65 89 0
-65 88 0
-64 90 0
-64 -89 0
-64 88 0
-63 -90 0
-63 -89 0
-63 88 0
-62 90 0
-62 89 0
-62 -88 0
-61 -90 0
-61 89 0
-61 -88 0
-60 90 0
-60 -89 0
-60 -88 0
-59 -90 0
-59 -89 0
-59 -88 0
-58 87 0
-58 86 0
-58 85 0
-57 -87 0
-57 86 0
-57 85 0
-56 87 0
-56 -86 0
-56 85 0
-55 -87 0
-55 -86 0
-55 85 0
-54 87 0
-54 86 0
-54 -85 0
-53 -87 0
-53 86 0
-53 -85 0
-52 87 0
-52 -86 0
-52 -85 0
-51 -87 0
-51 -86 0
-51 -85 0
-50 84 0
-50 83 0
-50 82 0
-49 -84 0
-49 83 0
-49 82 0
-48 84 0
-48 -83 0
-48 82 0
-47 -84 0
-47 -83 0
-47 82 0
-46 84 0
-46 83 0
-46 -82 0
-45 -84 0
-45 83 0
-45 -82 0
-44 84 0
-44 -83 0
-44 -82 0
-43 -84 0
-43 -83 0
-43 -82 0
-42 81 0
-42 80 0
-42 79 0
-41 -81 0
-41 80 0
-41 79 0
-40 81 0
-40 -80 0
-40 79 0
-39 -81 0
-39 -80 0
-39 79 0
-38 81 0
-38 80 0
-38 -79 0
-37 -81 0
-37 80 0
-37 -79 0
-36 81 0
-36 -80 0
-36 -79 0
-35 -81 0
-35 -80 0
-35 -79 0
-34 78 0
-34 77 0
-34 76 0
-33 -78 0
-33 77 0
-33 76 0
-32 78 0
-32 -77 0
-32 76 0
-31 -78 0
-31 -77 0
-31 76 0
-30 78 0
-30 77 0
-30 -76 0
-29 -78 0
-29 77 0
-29 -76 0
-28 78 0
-28 -77 0
-28 -76 0
-27 -78 0
-27 -77 0
-27 -76 0
-26 75 0
-26 74 0
-26 73 0
-25 -75 0
-25 74 0
-25 73 0
-24 75 0
-24 -74 0
-24 73 0
-23 -75 0
-23 -74 0
-23 73 0
-22 75 0
-22 74 0
-22 -73 0
-21 -75 0
-21 74 0
-21 -73 0
-20 75 0
-20 -74 0
-20 -73 0
-19 -75 0
-19 -74 0
-19 -73 0
-18 72 0
-18 71 0
-18 70 0
-17 -72 0
-17 71 0
-17 70 0
-16 72 0
-16 -71 0
-16 70 0
-15 -72 0
-15 -71 0
-15 70 0
-14 72 0
-14 71 0
-14 -70 0
-13 -72 0
-13 71 0
-13 -70 0
-12 72 0
-12 -71 0
-12 -70 0
-11 -72 0
-11 -71 0
-11 -70 0
-10 69 0
-10 68 0
-10 67 0
-9 -69 0
-9 68 0
-9 67 0
-8 69 0
-8 -68 0
-8 67 0
-7 -69 0
-7 -68 0
-7 67 0
-6 69 0
-6 68 0
-6 -67 0
-5 -69 0
-5 68 0
-5 -67 0
-4 69 0
-4 -68 0
-4 -67 0
-3 -69 0
-3 -68 0
-3 -67 0
1 0
-2 0
`;
const summary$1 = content2summary({ content: content$1, name: fileName$1.toLowerCase() });
({
  name: fileName$1.toLowerCase(),
  content: content$1,
  summary: summary$1,
  html: claims2html(summary$1.claims)
});
const fileName = "NQueens4.dimacs";
const content = `
p cnf 60 128
c this encode something in queens 4
-18 -60 0
-18 -59 0
-15 -58 0
-15 -57 0
-14 56 0
-17 -56 0
-14 -55 0
-11 -54 0
-11 53 0
-16 -53 0
-10 -52 0
-10 51 0
-13 52 0
c this encode something
-13 -51 0
-16 -52 0
-16 -51 0
-10 -50 0
-7 -49 0
-7 -48 0
-7 47 0
-12 48 0
-12 -47 0
-17 -48 0
-17 -47 0
-6 46 0
-6 45 0
-9 -46 0
-9 45 0
-12 46 0
-12 -45 0
-15 -46 0
-15 -45 0
-6 -44 0
-5 -43 0
-5 42 0
-8 43 0
-8 -42 0
-11 -43 0
-11 -42 0
-5 41 0
-10 -41 0
-4 40 0
-7 -40 0
-4 -39 0
-4 38 0
-9 39 0
-9 -38 0
-14 -39 0
-14 -38 0
-3 -37 0
-3 36 0
-3 35 0
-8 -36 0
-8 35 0
-13 36 0
-13 -35 0
-18 -36 0
-18 -35 0
18 14 10 6 0
-6 34 0
-6 33 0
-10 -34 0
-10 33 0
-14 34 0
-14 -33 0
-18 -34 0
-18 -33 0
17 13 9 5 0
-5 32 0
-5 31 0
-9 -32 0
-9 31 0
-13 32 0
-13 -31 0
-17 -32 0
-17 -31 0
16 12 8 4 0
-4 30 0
-4 29 0
-8 -30 0
-8 29 0
-12 30 0
-12 -29 0
-16 -30 0
-16 -29 0
15 11 7 3 0
-3 28 0
-3 27 0
-7 -28 0
-7 27 0
-11 28 0
-11 -27 0
-15 -28 0
-15 -27 0
-18 26 0
-18 25 0
-17 -26 0
-17 25 0
-16 26 0
-16 -25 0
-15 -26 0
-15 -25 0
-14 24 0
-14 23 0
-13 -24 0
-13 23 0
-12 24 0
-12 -23 0
-11 -24 0
-11 -23 0
-10 22 0
-10 21 0
-9 -22 0
-9 21 0
-8 22 0
-8 -21 0
-7 -22 0
-7 -21 0
-6 20 0
-6 19 0
-5 -20 0
-5 19 0
-4 20 0
-4 -19 0
-3 -20 0
-3 -19 0
c second last constraint
c i guess it works
1 0
-2 0`;
const summary = content2summary({ content, name: fileName.toLowerCase() });
({
  name: fileName.toLowerCase(),
  content,
  summary,
  html: claims2html(summary.claims)
});
const instanceStore = writable([]);
function ResetProblemDebuggerComponent($$payload, $$props) {
  push();
  const resetProps = { size: "md" };
  let resetModal = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<button class="btn general-btn" title="Reset">`;
    DynamicRender($$payload2, { component: RefreshOutline, props: resetProps });
    $$payload2.out += `<!----> `;
    Modal($$payload2, {
      size: "xs",
      class: "modal-style",
      dismissable: false,
      get open() {
        return resetModal;
      },
      set open($$value) {
        resetModal = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<div class="text-center">`;
        ExclamationCircleOutline($$payload3, { class: "mx-auto mb-4 h-12 w-12 text-red-600" });
        $$payload3.out += `<!----> <h3 class="mb-5 text-lg font-normal text-gray-600">By resetting the problem, all the assignments made will be erased. Are you sure?</h3> <button class="btn mr-4">Yes, I'm sure</button> <button class="btn">No, cancel</button></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!----></button>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function DebuggerComponent($$payload, $$props) {
  push();
  const problem = getProblemStore();
  let defaultNextVariable = problem.variables.nextVariable;
  let solverMachine2 = getSolverMachine();
  let enablePreprocess = solverMachine2.onInitialState();
  let enableBacktracking = solverMachine2.onConflictState();
  let enableConflictDetection = solverMachine2.onConflictDetection();
  let finished = solverMachine2.completed();
  let inAutoMode = solverMachine2.isInAutoMode();
  $$payload.out += `<debugger class="svelte-g36okl">`;
  if (inAutoMode) {
    $$payload.out += "<!--[-->";
    AutoModeComponent($$payload);
  } else {
    $$payload.out += "<!--[!-->";
    if (enablePreprocess) {
      $$payload.out += "<!--[-->";
      InitialStepDebuggerComponent($$payload);
    } else {
      $$payload.out += "<!--[!-->";
      if (enableConflictDetection) {
        $$payload.out += "<!--[-->";
        ConflictDetectionDebuggerComponent($$payload, { cdMode: enableConflictDetection });
      } else {
        $$payload.out += "<!--[!-->";
        if (!finished) {
          $$payload.out += "<!--[-->";
          AutomaticDebuggerComponent($$payload, {
            backtrackingState: enableBacktracking,
            finished,
            cdMode: enableConflictDetection,
            nextVariable: defaultNextVariable && !enableBacktracking ? defaultNextVariable : undefined
          });
          $$payload.out += `<!----> `;
          ManualDebuggerComponent($$payload, {
            defaultNextVariable,
            finished,
            cdMode: enableConflictDetection,
            backtrackingState: enableBacktracking
          });
          $$payload.out += `<!---->`;
        } else {
          $$payload.out += "<!--[!-->";
          ResetProblemDebuggerComponent($$payload);
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]--> `;
      GeneralDebuggerComponent($$payload, {
        finished,
        backtrackingState: enableBacktracking
      });
      $$payload.out += `<!---->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></debugger>`;
  pop();
}
const ALIGNMENT = {
  AUTO: "auto",
  START: "start",
  CENTER: "center",
  END: "end"
};
const DIRECTION = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical"
};
const SCROLL_CHANGE_REASON = {
  OBSERVED: 0,
  REQUESTED: 1
};
class SizeAndPositionManager {
  /**
   * @param {Options} options
   */
  constructor({ itemSize, itemCount, estimatedItemSize }) {
    this.itemSize = itemSize;
    this.itemCount = itemCount;
    this.estimatedItemSize = estimatedItemSize;
    this.itemSizeAndPositionData = {};
    this.lastMeasuredIndex = -1;
    this.checkForMismatchItemSizeAndItemCount();
    if (!this.justInTime) this.computeTotalSizeAndPositionData();
  }
  get justInTime() {
    return typeof this.itemSize === "function";
  }
  /**
   * @param {Options} options
   */
  updateConfig({ itemSize, itemCount, estimatedItemSize }) {
    if (itemCount != null) {
      this.itemCount = itemCount;
    }
    if (estimatedItemSize != null) {
      this.estimatedItemSize = estimatedItemSize;
    }
    if (itemSize != null) {
      this.itemSize = itemSize;
    }
    this.checkForMismatchItemSizeAndItemCount();
    if (this.justInTime && this.totalSize != null) {
      this.totalSize = undefined;
    } else {
      this.computeTotalSizeAndPositionData();
    }
  }
  checkForMismatchItemSizeAndItemCount() {
    if (Array.isArray(this.itemSize) && this.itemSize.length < this.itemCount) {
      throw Error(
        `When itemSize is an array, itemSize.length can't be smaller than itemCount`
      );
    }
  }
  /**
   * @param {number} index
   */
  getSize(index) {
    const { itemSize } = this;
    if (typeof itemSize === "function") {
      return itemSize(index);
    }
    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  }
  /**
   * Compute the totalSize and itemSizeAndPositionData at the start,
   * only when itemSize is a number or an array.
   */
  computeTotalSizeAndPositionData() {
    let totalSize = 0;
    for (let i = 0; i < this.itemCount; i++) {
      const size = this.getSize(i);
      const offset = totalSize;
      totalSize += size;
      this.itemSizeAndPositionData[i] = {
        offset,
        size
      };
    }
    this.totalSize = totalSize;
  }
  getLastMeasuredIndex() {
    return this.lastMeasuredIndex;
  }
  /**
   * This method returns the size and position for the item at the specified index.
   *
   * @param {number} index
   */
  getSizeAndPositionForIndex(index) {
    if (index < 0 || index >= this.itemCount) {
      throw Error(
        `Requested index ${index} is outside of range 0..${this.itemCount}`
      );
    }
    return this.justInTime ? this.getJustInTimeSizeAndPositionForIndex(index) : this.itemSizeAndPositionData[index];
  }
  /**
   * This is used when itemSize is a function.
   * just-in-time calculates (or used cached values) for items leading up to the index.
   *
   * @param {number} index
   */
  getJustInTimeSizeAndPositionForIndex(index) {
    if (index > this.lastMeasuredIndex) {
      const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
      let offset = lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;
      for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
        const size = this.getSize(i);
        if (size == null || isNaN(size)) {
          throw Error(`Invalid size returned for index ${i} of value ${size}`);
        }
        this.itemSizeAndPositionData[i] = {
          offset,
          size
        };
        offset += size;
      }
      this.lastMeasuredIndex = index;
    }
    return this.itemSizeAndPositionData[index];
  }
  getSizeAndPositionOfLastMeasuredItem() {
    return this.lastMeasuredIndex >= 0 ? this.itemSizeAndPositionData[this.lastMeasuredIndex] : { offset: 0, size: 0 };
  }
  /**
   * Total size of all items being measured.
   *
   * @return {number}
   */
  getTotalSize() {
    if (this.totalSize) return this.totalSize;
    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    return lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size + (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize;
  }
  /**
   * Determines a new offset that ensures a certain item is visible, given the alignment.
   *
   * @param {'auto' | 'start' | 'center' | 'end'} align Desired alignment within container
   * @param {number | undefined} containerSize Size (width or height) of the container viewport
   * @param {number | undefined} currentOffset
   * @param {number | undefined} targetIndex
   * @return {number} Offset to use to ensure the specified item is visible
   */
  getUpdatedOffsetForIndex({ align = ALIGNMENT.START, containerSize, currentOffset, targetIndex }) {
    if (containerSize <= 0) {
      return 0;
    }
    const datum = this.getSizeAndPositionForIndex(targetIndex);
    const maxOffset = datum.offset;
    const minOffset = maxOffset - containerSize + datum.size;
    let idealOffset;
    switch (align) {
      case ALIGNMENT.END:
        idealOffset = minOffset;
        break;
      case ALIGNMENT.CENTER:
        idealOffset = maxOffset - (containerSize - datum.size) / 2;
        break;
      case ALIGNMENT.START:
        idealOffset = maxOffset;
        break;
      default:
        idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
    }
    const totalSize = this.getTotalSize();
    return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
  }
  /**
   * @param {number} containerSize
   * @param {number} offset
   * @param {number} overscanCount
   * @return {{stop: number|undefined, start: number|undefined}}
   */
  getVisibleRange({ containerSize = 0, offset, overscanCount }) {
    const totalSize = this.getTotalSize();
    if (totalSize === 0) {
      return {};
    }
    const maxOffset = offset + containerSize;
    let start = this.findNearestItem(offset);
    if (start === undefined) {
      throw Error(`Invalid offset ${offset} specified`);
    }
    const datum = this.getSizeAndPositionForIndex(start);
    offset = datum.offset + datum.size;
    let stop = start;
    while (offset < maxOffset && stop < this.itemCount - 1) {
      stop++;
      offset += this.getSizeAndPositionForIndex(stop).size;
    }
    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      stop = Math.min(stop + overscanCount, this.itemCount - 1);
    }
    return {
      start,
      stop
    };
  }
  /**
   * Clear all cached values for items after the specified index.
   * This method should be called for any item that has changed its size.
   * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
   *
   * @param {number} index
   */
  resetItem(index) {
    this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
  }
  /**
   * Searches for the item (index) nearest the specified offset.
   *
   * If no exact match is found the next lowest item index will be returned.
   * This allows partially visible items (with offsets just before/above the fold) to be visible.
   *
   * @param {number} offset
   */
  findNearestItem(offset) {
    if (isNaN(offset)) {
      throw Error(`Invalid offset ${offset} specified`);
    }
    offset = Math.max(0, offset);
    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);
    if (lastMeasuredSizeAndPosition.offset >= offset) {
      return this.binarySearch({
        high: lastMeasuredIndex,
        low: 0,
        offset
      });
    } else {
      return this.exponentialSearch({
        index: lastMeasuredIndex,
        offset
      });
    }
  }
  /**
   * @private
   * @param {number} low
   * @param {number} high
   * @param {number} offset
   */
  binarySearch({ low, high, offset }) {
    let middle = 0;
    let currentOffset = 0;
    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      currentOffset = this.getSizeAndPositionForIndex(middle).offset;
      if (currentOffset === offset) {
        return middle;
      } else if (currentOffset < offset) {
        low = middle + 1;
      } else if (currentOffset > offset) {
        high = middle - 1;
      }
    }
    if (low > 0) {
      return low - 1;
    }
    return 0;
  }
  /**
   * @private
   * @param {number} index
   * @param {number} offset
   */
  exponentialSearch({ index, offset }) {
    let interval = 1;
    while (index < this.itemCount && this.getSizeAndPositionForIndex(index).offset < offset) {
      index += interval;
      interval *= 2;
    }
    return this.binarySearch({
      high: Math.min(index, this.itemCount - 1),
      low: Math.floor(index / 2),
      offset
    });
  }
}
(() => {
  let result = false;
  try {
    const arg = Object.defineProperty({}, "passive", {
      get() {
        result = { passive: true };
        return true;
      }
    });
    window.addEventListener("testpassive", arg, arg);
    window.remove("testpassive", arg, arg);
  } catch (e) {
  }
  return result;
})();
function VirtualList($$payload, $$props) {
  push();
  let height = $$props["height"];
  let width = fallback($$props["width"], "100%");
  let itemCount = $$props["itemCount"];
  let itemSize = $$props["itemSize"];
  let estimatedItemSize = fallback($$props["estimatedItemSize"], null);
  let stickyIndices = fallback($$props["stickyIndices"], null);
  let getKey = fallback($$props["getKey"], null);
  let scrollDirection = fallback($$props["scrollDirection"], () => DIRECTION.VERTICAL, true);
  let scrollOffset = fallback($$props["scrollOffset"], null);
  let scrollToIndex = fallback($$props["scrollToIndex"], null);
  let scrollToAlignment = fallback($$props["scrollToAlignment"], null);
  let scrollToBehaviour = fallback($$props["scrollToBehaviour"], "instant");
  let overscanCount = fallback($$props["overscanCount"], 3);
  const sizeAndPositionManager = new SizeAndPositionManager({
    itemCount,
    itemSize,
    estimatedItemSize: getEstimatedItemSize()
  });
  let items = [];
  let state = {
    offset: scrollOffset || scrollToIndex != null && items.length && getOffsetForIndex(scrollToIndex) || 0,
    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
  };
  let styleCache = {};
  let wrapperStyle = "";
  let innerStyle = "";
  refresh();
  onDestroy(() => {
  });
  function refresh() {
    const { offset } = state;
    const { start, stop } = sizeAndPositionManager.getVisibleRange({
      containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
      offset,
      overscanCount
    });
    let updatedItems = [];
    const totalSize = sizeAndPositionManager.getTotalSize();
    if (scrollDirection === DIRECTION.VERTICAL) {
      const unit = typeof height === "number" ? "px" : "";
      wrapperStyle = `height:${height}${unit};width:${width};`;
      innerStyle = `flex-direction:column;height:${totalSize}px;`;
    } else {
      const unit = typeof width === "number" ? "px" : "";
      wrapperStyle = `height:${height};width:${width}${unit}`;
      innerStyle = `min-height:100%;width:${totalSize}px;`;
    }
    const hasStickyIndices = stickyIndices != null && stickyIndices.length !== 0;
    if (hasStickyIndices) {
      for (let i = 0; i < stickyIndices.length; i++) {
        const index = stickyIndices[i];
        updatedItems.push({ index, style: getStyle(index, true) });
      }
    }
    if (start !== undefined && stop !== undefined) {
      for (let index = start; index <= stop; index++) {
        if (hasStickyIndices && stickyIndices.includes(index)) {
          continue;
        }
        updatedItems.push({ index, style: getStyle(index, false) });
      }
    }
    items = updatedItems;
  }
  function recomputeSizes(startIndex = 0) {
    styleCache = {};
    sizeAndPositionManager.resetItem(startIndex);
    refresh();
  }
  function getOffsetForIndex(index, align = scrollToAlignment, _itemCount = itemCount) {
    if (index < 0 || index >= _itemCount) {
      index = 0;
    }
    return sizeAndPositionManager.getUpdatedOffsetForIndex({
      align,
      containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
      currentOffset: state.offset || 0,
      targetIndex: index
    });
  }
  function getEstimatedItemSize() {
    return estimatedItemSize || typeof itemSize === "number" && itemSize || 50;
  }
  function getStyle(index, sticky) {
    if (styleCache[index]) return styleCache[index];
    const { size, offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index);
    let style;
    if (scrollDirection === DIRECTION.VERTICAL) {
      style = `left:0;width:100%;height:${size}px;`;
      if (sticky) {
        style += `position:sticky;flex-grow:0;z-index:1;top:0;margin-top:${offset}px;margin-bottom:${-(offset + size)}px;`;
      } else {
        style += `position:absolute;top:${offset}px;`;
      }
    } else {
      style = `top:0;width:${size}px;`;
      if (sticky) {
        style += `position:sticky;z-index:1;left:0;margin-left:${offset}px;margin-right:${-(offset + size)}px;`;
      } else {
        style += `position:absolute;height:100%;left:${offset}px;`;
      }
    }
    return styleCache[index] = style;
  }
  const each_array = ensure_array_like(items);
  $$payload.out += `<div class="virtual-list-wrapper svelte-dwpad5"${attr("style", wrapperStyle)}><!---->`;
  slot($$payload, $$props, "header", {}, null);
  $$payload.out += `<!----> <div class="virtual-list-inner svelte-dwpad5"${attr("style", innerStyle)}><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let item = each_array[$$index];
    $$payload.out += `<!---->`;
    slot($$payload, $$props, "item", { style: item.style, index: item.index }, null);
    $$payload.out += `<!---->`;
  }
  $$payload.out += `<!--]--></div> <!---->`;
  slot($$payload, $$props, "footer", {}, null);
  $$payload.out += `<!----></div>`;
  bind_props($$props, {
    height,
    width,
    itemCount,
    itemSize,
    estimatedItemSize,
    stickyIndices,
    getKey,
    scrollDirection,
    scrollOffset,
    scrollToIndex,
    scrollToAlignment,
    scrollToBehaviour,
    overscanCount,
    recomputeSizes
  });
  pop();
}
function BookmarkInstances($$payload, $$props) {
  push();
  var $$store_subs;
  let openModal = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<div class="bookmark svelte-1ddembi"><div class="bookmark-preview svelte-1ddembi">`;
    {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div> <div class="bookmark-list svelte-1ddembi">`;
    if (store_get($$store_subs ??= {}, "$instanceStore", instanceStore)) {
      $$payload2.out += "<!--[-->";
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$instanceStore", instanceStore));
      $$payload2.out += `<ul class="items scrollable svelte-1ddembi"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let instance = each_array[$$index];
        $$payload2.out += `<li class="svelte-1ddembi"><button${attr("class", `item svelte-1ddembi ${stringify([instance.active ? "selected" : ""].filter(Boolean).join(" "))}`)}><p class="svelte-1ddembi">${escape_html(instance.name)}</p></button> <button${attr("class", `icon svelte-1ddembi ${stringify([
          instance.removable && !instance.active ? "removable" : "",
          !instance.removable || instance.active ? "invalid" : ""
        ].filter(Boolean).join(" "))}`)}${attr("disabled", !instance.removable || instance.active, true)}>`;
        if (instance.removable && !instance.active) {
          $$payload2.out += "<!--[-->";
          TrashBinOutline($$payload2, {});
        } else {
          $$payload2.out += "<!--[!-->";
          if (instance.removable && instance.active) {
            $$payload2.out += "<!--[-->";
            LockOutline($$payload2, {});
          } else {
            $$payload2.out += "<!--[!-->";
            DatabaseOutline($$payload2, {});
          }
          $$payload2.out += `<!--]-->`;
        }
        $$payload2.out += `<!--]--></button></li>`;
      }
      $$payload2.out += `<!--]--></ul>`;
    } else {
      $$payload2.out += "<!--[!-->";
    }
    $$payload2.out += `<!--]--></div></div> `;
    Modal($$payload2, {
      size: "xs",
      class: "modal-style",
      dismissable: false,
      get open() {
        return openModal;
      },
      set open($$value) {
        openModal = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<div class="text-center">`;
        ExclamationCircleOutline($$payload3, { class: "mx-auto mb-4 h-12 w-12 text-red-600" });
        $$payload3.out += `<!----> <h3 class="mb-5 text-lg font-normal text-gray-600">By changing the problem, all the assignments made will be erased. Are you sure?</h3> <button class="btn btn-modal mr-4"><span>Yes, change</span></button> <button class="btn"><span>No, cancel</span></button></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function AlgorithmComponent($$payload, $$props) {
  push();
  let { iconClass } = $$props;
  const elementClass = "rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2";
  let currentAlgorithm = getProblemStore().algorithm;
  const availableAlgorithms = ["backtracking", "dpll", "cdcl"];
  let resetModal = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    const each_array = ensure_array_like(availableAlgorithms);
    $$payload2.out += `<div class="heading-class">`;
    DynamicRender($$payload2, {
      component: CodePullRequestOutline,
      props: iconClass
    });
    $$payload2.out += `<!----> <span class="pt-1">Algorithm</span></div> <div class="body-class"><algorithm${attr("class", clsx(elementClass) + " svelte-6ei02o")}><selector class="flex items-center gap-4"><label for="algorithm">Algorithm:</label> <select id="algorithm" class="flex-1 rounded-lg border-[var(--border-color)] text-right outline-none focus:outline-none focus:ring-0"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let algorithm = each_array[$$index];
      $$payload2.out += `<option${attr("value", algorithm)}${attr("selected", algorithm === currentAlgorithm, true)}>${escape_html(algorithm)}</option>`;
    }
    $$payload2.out += `<!--]--></select></selector> <div class="overflow-hidden transition-all duration-300 ease-in-out"${attr("style", `max-height: ${stringify("0")}`)}><div class="mt-4 h-[20rem] w-full rounded-lg bg-[var(--main-bg-color)]"></div></div></algorithm></div> `;
    Modal($$payload2, {
      size: "xs",
      class: "modal-style",
      dismissable: false,
      get open() {
        return resetModal;
      },
      set open($$value) {
        resetModal = $$value;
        $$settled = false;
      },
      children: ($$payload3) => {
        $$payload3.out += `<div class="text-center">`;
        ExclamationCircleOutline($$payload3, { class: "mx-auto mb-4 h-12 w-12 text-red-600" });
        $$payload3.out += `<!----> <h3 class="mb-5 text-lg font-normal text-gray-600">By changing the algorithm, all the assignments made will be erased. Are you sure?</h3> <button class="btn mr-4 svelte-6ei02o">Yes, I'm sure</button> <button class="btn svelte-6ei02o"><span>No, cancel</span></button></div>`;
      },
      $$slots: { default: true }
    });
    $$payload2.out += `<!---->`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  pop();
}
function BreakingpointComponent($$payload, $$props) {
  push();
  let { iconClass } = $$props;
  const elementClass = "rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2";
  let breakpointVariables = getBreakpoints();
  const showVariables = Array.from(breakpointVariables.values()).sort((a, b) => a - b);
  let variableToAdd = undefined;
  const problem = getProblemStore();
  const each_array = ensure_array_like(showVariables);
  $$payload.out += `<div class="heading-class">`;
  DynamicRender($$payload, { component: BugOutline, props: iconClass });
  $$payload.out += `<!----> <span class="pt-1">Breakpoints</span></div> <div class="body-class"><variables${attr("class", `${stringify(elementClass)} flex items-center justify-between svelte-uhnboa`)}><label for="baselineDelay" class="whitespace-nowrap text-gray-900">Variable:</label> <input id="baselineDelay" type="number" class="w-32 rounded-lg border border-[var(--border-color)] text-right focus:outline-none focus:ring-0"${attr("value", variableToAdd)}${attr("min", 1)}${attr("max", problem.variables.capacity)}></variables> <variables-display class="breakpoint-display svelte-uhnboa"><div${attr("class", `${stringify(elementClass)} scroll-container svelte-uhnboa`)}><ul class="items scrollable svelte-uhnboa"><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let variable = each_array[$$index];
    $$payload.out += `<li class="svelte-uhnboa"><button class="variable-text svelte-uhnboa">${escape_html(variable)}</button></li>`;
  }
  $$payload.out += `<!--]--></ul></div></variables-display></div>`;
  pop();
}
function PrametersComponent($$payload, $$props) {
  push();
  let { iconClass } = $$props;
  const elementClass = "rounded-lg bg-[var(--main-bg-color)] border border-[var(--border-color)] p-2";
  let baselineDelay2 = getBaselineDelay();
  $$payload.out += `<div class="heading-class">`;
  DynamicRender($$payload, { component: CogOutline, props: iconClass });
  $$payload.out += `<!----> <span class="pt-1">Parameters</span></div> <div class="body-class"><div${attr("class", `${stringify(elementClass)} flex items-center justify-between gap-2 svelte-9lgjck`)}><label for="baselineDelay" class="whitespace-nowrap text-gray-900">Delay:</label> <div class="flex items-center gap-2"><button${attr("class", `delay-buttons svelte-9lgjck ${stringify([""].filter(Boolean).join(" "))}`)}>−</button> <input id="baselineDelay" type="number" class="w-20 rounded border border-[var(--border-color)] py-0 text-center leading-none"${attr("value", baselineDelay2)} readonly> <button${attr("class", `delay-buttons svelte-9lgjck ${stringify([""].filter(Boolean).join(" "))}`)}>+</button></div></div> <polarity${attr("class", clsx(elementClass) + " svelte-9lgjck")}><div class="flex w-full items-center justify-between"><span class="pr-2">Polarity:</span> <div class="inline-flex rounded-lg" role="group"><button${attr("class", `${stringify(`border border-[var(--border-color)] px-4 py-2 transition-colors duration-300 ${"bg-[var(--icon-base)] text-white"} rounded-l-lg`)} svelte-9lgjck`)}>True</button> <button${attr("class", `${stringify(`border border-[var(--border-color)] px-4 py-2 transition-colors duration-300 ${"bg-white hover:bg-[var(--icon-light)]"} rounded-r-lg`)} svelte-9lgjck`)}>False</button></div></div></polarity></div>`;
  pop();
}
function EngineComponent($$payload) {
  const iconClass = { size: "xl" };
  $$payload.out += `<div class="content-container svelte-g5kj0o">`;
  AlgorithmComponent($$payload, { iconClass });
  $$payload.out += `<!----></div> <div class="division-container svelte-g5kj0o"></div> <div class="content-container svelte-g5kj0o">`;
  BreakingpointComponent($$payload, { iconClass });
  $$payload.out += `<!----></div> <div class="division-container svelte-g5kj0o"></div> <div class="content-container svelte-g5kj0o">`;
  PrametersComponent($$payload, { iconClass });
  $$payload.out += `<!----></div>`;
}
function LegendComponent($$payload, $$props) {
  push();
  const exampleVariable = new Variable(1, true);
  const decisionExample = VariableAssignment.newManualAssignment(exampleVariable);
  const backtrackingExample = VariableAssignment.newBacktrackingAssignment(exampleVariable);
  const unitPropagationExample = VariableAssignment.newUnitPropagationAssignment(exampleVariable, 1);
  $$payload.out += `<div class="legend pointer-events-none flex flex-col items-center text-center svelte-1ibt6ce"><div class="flex w-full max-w-4xl flex-row items-start justify-center"><div class="flex flex-1 flex-col items-center"><p class="mb-2"><strong>Decision expanded</strong></p> `;
  ChildlessDecisionComponent($$payload, { assignment: decisionExample });
  $$payload.out += `<!----></div> <div class="flex flex-1 flex-col items-center"><p class="mb-2"><strong>Decision colapsed</strong></p> `;
  DecisionComponent($$payload, { assignment: decisionExample, expanded: false });
  $$payload.out += `<!----></div></div> <div class="flex w-full max-w-4xl flex-row items-start justify-center"><div class="flex flex-1 flex-col items-center"><p class="mb-2"><strong>Backtracking</strong></p> `;
  BacktrackingComponent($$payload, { assignment: backtrackingExample });
  $$payload.out += `<!----></div> <div class="flex flex-1 flex-col items-center"><p class="mb-2"><strong>Unit Propagations</strong></p> `;
  UnitPropagationComponent($$payload, { assignment: unitPropagationExample });
  $$payload.out += `<!----></div></div></div>`;
  pop();
}
let activeView = "bookmark";
const getActiveView = () => activeView;
const setActiveView = (view) => activeView = view;
function NavBarComponent($$payload, $$props) {
  push();
  const selected = getActiveView();
  let { event } = $$props;
  let inputRef;
  BottomNav($$payload, {
    position: "absolute",
    navType: "application",
    classOuter: "bottomNavStyle",
    classInner: "grid-cols-5",
    children: ($$payload2) => {
      BottomNavItem($$payload2, {
        btnName: "Hide",
        appBtnPosition: "left",
        onclick: () => event?.("close"),
        btnClass: "bottomNavItem",
        children: ($$payload3) => {
          ArrowDownToBracketOutline($$payload3, {
            class: `settings-icones group-hover:text-primary-600`
          });
          $$payload3.out += `<!----> `;
          Tooltip($$payload3, {
            arrow: false,
            children: ($$payload4) => {
              $$payload4.out += `<!---->Hide`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      BottomNavItem($$payload2, {
        btnName: "Legend",
        btnClass: "bottomNavItem",
        appBtnPosition: "middle",
        onclick: () => event?.("info"),
        children: ($$payload3) => {
          ExclamationCircleOutline($$payload3, {
            class: `settings-icones group-hover:text-primary-600 ${selected === "info" ? "active" : ""}`
          });
          $$payload3.out += `<!----> `;
          Tooltip($$payload3, {
            arrow: false,
            children: ($$payload4) => {
              $$payload4.out += `<!---->Legend`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> <div class="flex items-center justify-center">`;
      BottomNavItem($$payload2, {
        btnName: "Add instance",
        appBtnPosition: "middle",
        btnClass: "inline-flex items-center justify-center w-10 h-10 font-medium bg-primary-600 rounded-full hover:bg-primary-700 group focus:ring-4 focus:ring-primary-300 focus:outline-hidden bottomNavCenter",
        onclick: () => inputRef.click(),
        children: ($$payload3) => {
          $$payload3.out += `<input type="file" hidden accept=".dimacs,.cnf,.txt" multiple> `;
          PlusOutline($$payload3, { class: "text-white" });
          $$payload3.out += `<!----> `;
          Tooltip($$payload3, {
            arrow: false,
            children: ($$payload4) => {
              $$payload4.out += `<!---->Add instance`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----></div> `;
      BottomNavItem($$payload2, {
        btnName: "Instances",
        btnClass: "bottomNavItem",
        appBtnPosition: "middle",
        onclick: () => event?.("bookmark"),
        children: ($$payload3) => {
          BookOpenOutline($$payload3, {
            class: `settings-icones group-hover:text-primary-600 ${selected === "bookmark" ? "active" : ""}`
          });
          $$payload3.out += `<!----> `;
          Tooltip($$payload3, {
            arrow: false,
            children: ($$payload4) => {
              $$payload4.out += `<!---->Instances`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!----> `;
      BottomNavItem($$payload2, {
        btnName: "Engine",
        btnClass: "bottomNavItem",
        appBtnPosition: "right",
        onclick: () => event?.("engine"),
        children: ($$payload3) => {
          AdjustmentsVerticalOutline($$payload3, {
            class: `settings-icones group-hover:text-primary-600 ${selected === "engine" ? "active" : ""}`
          });
          $$payload3.out += `<!----> `;
          Tooltip($$payload3, {
            arrow: false,
            children: ($$payload4) => {
              $$payload4.out += `<!---->Engine`;
            },
            $$slots: { default: true }
          });
          $$payload3.out += `<!---->`;
        },
        $$slots: { default: true }
      });
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  pop();
}
function SettingsComponent($$payload, $$props) {
  push();
  let view = getActiveView();
  function handleOptionEvent(event) {
    if (event === "close") {
      closeSettingsViewEventBus.emit();
    } else {
      setActiveView(event);
    }
  }
  $$payload.out += `<div class="settings svelte-bbhrtn"><div class="setting-view svelte-bbhrtn"><class class="setting-content svelte-bbhrtn">`;
  if (view) {
    $$payload.out += "<!--[-->";
    if (view === "bookmark") {
      $$payload.out += "<!--[-->";
      BookmarkInstances($$payload);
    } else {
      $$payload.out += "<!--[!-->";
      if (view === "engine") {
        $$payload.out += "<!--[-->";
        EngineComponent($$payload);
      } else {
        $$payload.out += "<!--[!-->";
        LegendComponent($$payload);
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></class></div> `;
  NavBarComponent($$payload, { event: handleOptionEvent });
  $$payload.out += `<!----></div>`;
  pop();
}
function SolvingInformationComponent($$payload, $$props) {
  push();
  let activeInstance = "";
  const problem = getProblemStore();
  $$payload.out += `<div class="text svelte-18xfs2b"><span class="text-right">${escape_html(problem.algorithm)}</span> <span class="text-left">${escape_html(activeInstance)}</span></div>`;
  pop();
}
function StatisticsComponent($$payload, $$props) {
  push();
  const problem = getProblemStore();
  const decisions = getNoDecisions();
  const conflicts = getNoConflicts();
  const unitPropagations = getNoUnitPropagations();
  const decisionLevelCurrentTrail = (() => {
    const latestTrail = getLatestTrail();
    if (latestTrail) {
      return latestTrail.getDecisionLevel();
    } else return 0;
  })();
  const clausesLeft2 = problem.clauses.leftToSatisfy();
  const minimumClausesLeft = (() => {
    const collection = getClausesLeft();
    let minimum = undefined;
    for (let i = 0; i < getTrails().length; i++) {
      if (collection[i] !== undefined && minimum === undefined || minimum !== undefined && collection[i] < minimum) minimum = collection[i];
    }
    return minimum;
  })();
  const finished = getSolverMachine().onFinalState();
  const unsat2 = getSolverMachine().onUnsatState();
  $$payload.out += `<div class="h-full space-y-5 pt-2"><div class="flex place-content-around"><div class="metric svelte-t642ei">Decision Level: <span class="statistic-value svelte-t642ei">${escape_html(decisionLevelCurrentTrail)}</span></div> `;
  if (!finished) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="metric svelte-t642ei">Clauses left: <span class="statistic-value svelte-t642ei">${escape_html(clausesLeft2)}</span></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> `;
  if (unsat2) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="metric svelte-t642ei">Minimum Clauses: <span class="statistic-value svelte-t642ei">${escape_html(minimumClausesLeft)}</span></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="metric svelte-t642ei"><span>Decisions:</span> <span class="statistic-value svelte-t642ei">${escape_html(decisions)}</span></div> <div class="metric svelte-t642ei"><span>Conflicts:</span> <span class="statistic-value svelte-t642ei">${escape_html(conflicts)}</span></div> <div class="metric svelte-t642ei"><span>UPs:</span> <span class="statistic-value svelte-t642ei">${escape_html(unitPropagations)}</span></div></div></div>`;
  pop();
}
function ToastComponent($$payload, $$props) {
  push();
  let { toast } = $$props;
  $$payload.out += `<div${attr("class", `toast svelte-mbgvwb ${stringify([""].filter(Boolean).join(" "))}`)}>`;
  if (toast.type === "error") {
    $$payload.out += "<!--[-->";
    ExclamationCircleOutline($$payload, { color: "red", slot: "icon", class: "h-5 w-5" });
  } else {
    $$payload.out += "<!--[!-->";
    if (toast.type === "warn") {
      $$payload.out += "<!--[-->";
      ExclamationCircleOutline($$payload, {
        color: "orange",
        slot: "icon",
        class: "h-5 w-5"
      });
    } else {
      $$payload.out += "<!--[!-->";
      if (toast.type === "info") {
        $$payload.out += "<!--[-->";
        ExclamationCircleOutline($$payload, {
          color: "blue",
          slot: "icon",
          class: "h-5 w-5"
        });
      } else {
        $$payload.out += "<!--[!-->";
        if (toast.type === "breakpoint") {
          $$payload.out += "<!--[-->";
          FlagOutline($$payload, { color: "purple", class: "h-5 w-5" });
        } else {
          $$payload.out += "<!--[!-->";
          if (toast.type === "sat") {
            $$payload.out += "<!--[-->";
            CheckOutline($$payload, {
              color: "green",
              slot: "icon",
              class: "h-5 w-5"
            });
          } else {
            $$payload.out += "<!--[!-->";
            CloseOutline($$payload, { color: "red", slot: "icon", class: "h-5 w-5" });
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--> <div class="flex items-center"><div class="ms-3"><h4 class="font-semibold text-gray-900">${escape_html(toast.title)}</h4> <div class="description font-normal svelte-mbgvwb">${escape_html(toast.description)}</div></div></div> <button class="close svelte-mbgvwb">`;
  CloseCircleOutline($$payload, {});
  $$payload.out += `<!----></button></div>`;
  pop();
}
function Button($$payload, $$props) {
  let { onClick, icon, active } = $$props;
  const iconProps = { class: "h-8 w-8 cursor-pointer" };
  $$payload.out += `<div class="flex flex-row"><button type="button"${attr("class", `button-high-contrast !p-2 svelte-6azehl ${stringify([active ? "active" : ""].filter(Boolean).join(" "))}`)}>`;
  if (icon) {
    $$payload.out += "<!--[-->";
    DynamicRender($$payload, { component: icon, props: iconProps });
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></button></div>`;
}
function LiteralComponent($$payload, $$props) {
  push();
  let { literal } = $$props;
  $$payload.out += `<div${attr("class", `literal-component svelte-1ggkeu6 ${stringify([
    !literal.isAssigned() ? "undefined" : "",
    literal.isTrue() ? "true" : "",
    literal.isFalse() ? "false" : ""
  ].filter(Boolean).join(" "))}`)}>`;
  MathTexComponent($$payload, { equation: literal.toTeX() });
  $$payload.out += `<!----></div>`;
  pop();
}
function ClauseComponent($$payload, $$props) {
  push();
  let { clause } = $$props;
  const each_array = ensure_array_like(clause);
  $$payload.out += `<div class="clause-style svelte-g0uthy"><!--[-->`;
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let lit = each_array[i];
    LiteralComponent($$payload, { literal: lit });
    $$payload.out += `<!----> `;
    if (i < clause.nLiterals() - 1) {
      $$payload.out += "<!--[-->";
      MathTexComponent($$payload, { equation: "\\lor", fontSize: "1rem" });
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></div>`;
  pop();
}
function ConflictDetectionComponent($$payload, $$props) {
  push();
  const problem = getProblemStore();
  let clauses = (() => {
    const target = getClausesToCheck();
    const cPool = problem.clauses;
    return target.map((id) => cPool.get(id));
  })();
  let checkingIndex2 = getCheckingIndex();
  const each_array = ensure_array_like(clauses);
  $$payload.out += `<!--[-->`;
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let clause = each_array[index];
    $$payload.out += `<div class="enumerate-clause svelte-10dc4zd"><div${attr("class", `enumerate svelte-10dc4zd ${stringify([index === checkingIndex2 ? "checking" : ""].filter(Boolean).join(" "))}`)}><span>${escape_html(clause.getId())}.</span></div> `;
    ClauseComponent($$payload, { clause });
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
function FlexVirtualList($$payload, $$props) {
  push();
  let { items, itemSize } = $$props;
  let virtualHeight = 500;
  $$payload.out += `<div class="flex-virtual-wrapper svelte-1tjbwkm">`;
  VirtualList($$payload, {
    width: "100%",
    height: virtualHeight,
    scrollDirection: "vertical",
    itemCount: items.length,
    itemSize,
    $$slots: {
      item: ($$payload2, { index, style }) => {
        $$payload2.out += `<div slot="item" class="item-list"${attr("style", style)}><!---->`;
        slot($$payload2, $$props, "item", { item: items[index], index }, null);
        $$payload2.out += `<!----></div>`;
      }
    }
  });
  $$payload.out += `<!----></div>`;
  pop();
}
function ProblemPreviewComponent($$payload, $$props) {
  push();
  let { clauseHeight = 50 } = $$props;
  const problem = getProblemStore();
  let clauses = problem.clauses.getClauses();
  $$payload.out += `<solution-summary class="svelte-1mhil2h">`;
  FlexVirtualList($$payload, {
    items: clauses,
    itemSize: clauseHeight,
    $$slots: {
      item: ($$payload2, { item }) => {
        $$payload2.out += `<div slot="item" class="clause svelte-1mhil2h"><div class="enumerate-clause svelte-1mhil2h"><div class="enumerate svelte-1mhil2h"><span>${escape_html(item.getId())}.</span></div> `;
        ClauseComponent($$payload2, { clause: item });
        $$payload2.out += `<!----></div></div>`;
      }
    }
  });
  $$payload.out += `<!----></solution-summary>`;
  pop();
}
function snippetClausesToCheck($$payload) {
  ConflictDetectionComponent($$payload);
}
function notImplementedYet($$payload, what) {
  $$payload.out += `<p>Missing ${escape_html(what)}</p>`;
}
function ToolsComponent($$payload, $$props) {
  push();
  let toolsViewRef;
  let tools = [];
  let closed = tools.every((v) => v.active === false);
  function activateTool(what) {
    const alreadyActive = tools[what].active;
    if (alreadyActive) {
      tools[what].active = false;
    } else {
      tools = tools.map((v) => ({ ...v, active: false }));
      tools[what].active = true;
      toolsViewRef.style.width = "var(--max-width-tools)";
    }
    tools = [...tools];
  }
  function onOpenViewMoreEvent() {
    openSettingsViewEventBus.emit();
  }
  function toolA($$payload2, id) {
    Button($$payload2, {
      onClick: () => activateTool(id),
      icon: FileCirclePlusOutline,
      active: tools[id].active
    });
  }
  function toolB($$payload2, id) {
    Button($$payload2, {
      onClick: () => activateTool(id),
      icon: BugOutline,
      active: tools[id].active
    });
  }
  function settings($$payload2) {
    Button($$payload2, {
      onClick: onOpenViewMoreEvent,
      icon: ArrowUpFromBracketOutline
    });
  }
  const each_array = ensure_array_like(tools);
  const each_array_1 = ensure_array_like(tools);
  $$payload.out += `<div class="tools-container"><div class="options-tools"><!--[-->`;
  for (let id = 0, $$length = each_array.length; id < $$length; id++) {
    let { name } = each_array[id];
    $$payload.out += `<div class="toggle-button">`;
    if (name === "viewA") {
      $$payload.out += "<!--[-->";
      toolA($$payload, id);
    } else {
      $$payload.out += "<!--[!-->";
      if (name === "viewB") {
        $$payload.out += "<!--[-->";
        toolB($$payload, id);
      } else {
        $$payload.out += "<!--[!-->";
        notImplementedYet($$payload);
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]--> <div class="toggle-button settings-btn">`;
  settings($$payload);
  $$payload.out += `<!----></div> <div class="vertical-separator"></div></div> <div${attr("class", `tool-content scrollable-content ${stringify([closed ? "hide-tools-view" : ""].filter(Boolean).join(" "))}`)}><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let { name, active } = each_array_1[$$index_1];
    if (active) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div class="view">`;
      if (name === "viewA") {
        $$payload.out += "<!--[-->";
        snippetClausesToCheck($$payload);
      } else {
        $$payload.out += "<!--[!-->";
        if (name === "viewB") {
          $$payload.out += "<!--[-->";
          ProblemPreviewComponent($$payload, {});
        } else {
          $$payload.out += "<!--[!-->";
          notImplementedYet($$payload);
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]--></div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></div> <div${attr("class", `draggable-bar vertical-separator cursor-col-resize ${stringify([""].filter(Boolean).join(" "))}`)}></div></div>`;
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  $$payload.out += `<main class="chakra-petch-medium svelte-iervev">`;
  if (store_get($$store_subs ??= {}, "$toasts", toasts)) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toasts", toasts));
    $$payload.out += `<div class="toasts svelte-iervev"><!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let toast = each_array[$$index];
      ToastComponent($$payload, { toast });
    }
    $$payload.out += `<!--]--></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <tools>`;
  ToolsComponent($$payload);
  $$payload.out += `<!----></tools> <workspace class="svelte-iervev"><user class="svelte-iervev">`;
  DebuggerComponent($$payload);
  $$payload.out += `<!----> `;
  SolvingInformationComponent($$payload);
  $$payload.out += `<!----></user> `;
  AppComponent($$payload);
  $$payload.out += `<!----></workspace></main> <footer-component class="svelte-iervev">`;
  StatisticsComponent($$payload);
  $$payload.out += `<!----></footer-component> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<settings>`;
    SettingsComponent($$payload);
    $$payload.out += `<!----></settings>`;
  }
  $$payload.out += `<!--]-->`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BrRB7TLf.js.map
