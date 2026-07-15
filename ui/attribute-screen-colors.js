(function () {
  "use strict";

  var COLORS = {
    ATTRIBUTE_CULTURAL:     { hex: "#7a5a9e", rgb: "122,90,158" },
    ATTRIBUTE_POLITICAL:    { hex: "#3355cc", rgb: "51,85,204" },
    ATTRIBUTE_ECONOMIC:     { hex: "#ccac4a", rgb: "204,172,74" },
    ATTRIBUTE_EXPANSIONIST: { hex: "#33aa33", rgb: "51,170,51" },
    ATTRIBUTE_MILITARISTIC: { hex: "#963535", rgb: "150,53,53" },
    ATTRIBUTE_SCIENTIFIC:   { hex: "#8da3dd", rgb: "141,163,221" }
  };

  var DARK_LINE = "#2B313D";

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function blendColors(hex1, hex2, t) {
    var a = hexToRgb(hex1);
    var b = hexToRgb(hex2);
    return rgbToHex(
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    );
  }

  function injectCSS() {
    var css = "";
    for (var key in COLORS) {
      var c = COLORS[key];
      css += 'fxs-slot#' + key + ' .tree-grid-card { outline: 2px solid ' + c.hex + ' !important; outline-offset: 3px; border-radius: 4px; }\n';
      css += 'fxs-slot#' + key + ' attribute-small-card .img-sub-circle { box-shadow: 0 0 0 2px ' + c.hex + ' !important; }\n';
      css += 'fxs-slot#' + key + ' .checkmark-icon { background-color: ' + c.hex + ' !important; }\n';
      css += 'fxs-slot#' + key + ' .repeated-icon { background-color: ' + c.hex + ' !important; }\n';
    }
    var style = document.createElement("style");
    style.id = "asc-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function setLineColor(line, color) {
    line.style.backgroundColor = color;
    var splits = line.querySelectorAll(".bottom-split, .top-split, .center-split, .right-split, .left-split");
    for (var s = 0; s < splits.length; s++) {
      splits[s].style.backgroundColor = color;
    }
    var arrow = line.querySelector(".tree-line-arrow");
    if (arrow) {
      arrow.style.borderBottomColor = color;
    }
  }

  function colorScreen(screen) {
    var slotGroup = screen.querySelector("fxs-slot-group");
    var activeSlotId = slotGroup ? slotGroup.getAttribute("selected-slot") : null;
    var activeColor = activeSlotId && COLORS[activeSlotId] ? COLORS[activeSlotId] : null;

    var frame = screen.querySelector("fxs-subsystem-frame");
    if (frame) {
      frame.style.backgroundColor = activeColor
        ? "rgba(" + activeColor.rgb + ",0.28)"
        : "";
    }

    var slots = screen.querySelectorAll("fxs-slot");
    for (var i = 0; i < slots.length; i++) {
      var sid = slots[i].id;
      if (!sid || !COLORS[sid]) continue;
      var c = COLORS[sid];

      var cards = slots[i].querySelectorAll(".tree-grid-card");
      for (var m = 0; m < cards.length; m++) {
        cards[m].style.outline = "2px solid " + c.hex;
        cards[m].style.outlineOffset = "3px";
        cards[m].style.borderRadius = "4px";

        var attrCard = cards[m].querySelector("attribute-card");
        var isCompleted = attrCard && attrCard.getAttribute("completed") === "true";
        var chooser = cards[m].querySelector("chooser-item");
        var bgDiv = cards[m].querySelector(".hud_sidepanel_list-bg");
        if (isCompleted) {
          if (chooser) {
            chooser.style.boxShadow = "inset 0 0 0 200px rgba(" + c.rgb + ",0.95)";
            chooser.style.outline = "2px solid " + c.hex;
            chooser.style.outlineOffset = "2px";
          }
          if (bgDiv) {
            bgDiv.style.backgroundColor = "rgba(" + c.rgb + ",0.9)";
          }
        } else {
          if (chooser) {
            chooser.style.boxShadow = "inset 0 0 0 200px rgba(" + c.rgb + ",0.32)";
            chooser.style.outline = "none";
          }
          if (bgDiv) {
            bgDiv.style.backgroundColor = "rgba(" + c.rgb + ",0.22)";
          }
        }
      }

      var checkmarks = slots[i].querySelectorAll(".checkmark-icon");
      for (var c2 = 0; c2 < checkmarks.length; c2++) {
        checkmarks[c2].style.backgroundColor = c.hex;
      }

      var repeated = slots[i].querySelectorAll(".repeated-icon");
      for (var r = 0; r < repeated.length; r++) {
        repeated[r].style.backgroundColor = c.hex;
      }

      var treeLines = slots[i].querySelectorAll(".tree-line");
      for (var t = 0; t < treeLines.length; t++) {
        var line = treeLines[t];
        var fromId = line.getAttribute("from");
        var toId = line.getAttribute("to");

        var fromCard = fromId ? slots[i].querySelector('attribute-card[type="' + fromId + '"]') : null;
        var toCard = toId ? slots[i].querySelector('attribute-card[type="' + toId + '"]') : null;

        var fromDone = fromCard && fromCard.getAttribute("completed") === "true";
        var toDone = toCard && toCard.getAttribute("completed") === "true";

        if (fromDone && toDone) {
          setLineColor(line, c.hex);
        } else if (fromDone || toDone) {
          setLineColor(line, blendColors(c.hex, DARK_LINE, 0.75));
        } else {
          setLineColor(line, DARK_LINE);
        }
      }

      var smalls = slots[i].querySelectorAll("attribute-small-card .img-sub-circle");
      for (var n = 0; n < smalls.length; n++) {
        smalls[n].style.boxShadow = "0 0 0 2px " + c.hex;
      }
    }
  }

  function init(screen) {
    if (screen.getAttribute("data-asc") === "1") return;
    screen.setAttribute("data-asc", "1");

    colorScreen(screen);

    var tabBar = screen.querySelector("fxs-tab-bar");
    if (tabBar) {
      tabBar.addEventListener("tab-selected", function () {
        colorScreen(screen);
      });
    }

    new MutationObserver(function () {
      colorScreen(screen);
    }).observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ["completed"] });
  }

  function scan() {
    var all = document.querySelectorAll("screen-attribute-trees");
    for (var i = 0; i < all.length; i++) {
      if (all[i].isConnected) init(all[i]);
    }
  }

  function start() {
    injectCSS();
    scan();
    new MutationObserver(scan).observe(
      document.body,
      { childList: true, subtree: true }
    );
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();
