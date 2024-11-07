const semanasDataURL = "https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/semanas.json";

const width = 800;
const height = 400;
const margin = { top: 40, right: 30, bottom: 60, left: 120 };

Date.prototype.getWeek = function() {
    const firstDayOfYear = new Date(this.getFullYear(), 0, 1);
    const pastDaysOfYear = (this - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};
const currentWeek = new Date().getWeek();

function getInitialWeekRange() {
  const startWeek = Math.floor((currentWeek - 1) / 4) * 4 + 1;
  const endWeek = startWeek + 3;
  return `${startWeek}-${endWeek}`;
}

function createWeekRangeOptions() {
  const select = document.getElementById("semana-filter");
  for (let i = 1; i <= 52; i += 4) {
    const option = document.createElement("option");
    option.value = `${i}-${i + 3}`;
    option.text = `${i}-${i + 3}`;
    select.appendChild(option);
  }
  select.value = getInitialWeekRange();
}

document.addEventListener("DOMContentLoaded", function () {
  createWeekRangeOptions();

  const svg = d3
    .select("#vis-2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "12px")
    .style("background", "rgba(255, 255, 255, 0.9)")
    .style("border", "1px solid #ccc")
    .style("color", "#333")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
    .style("visibility", "hidden");

  d3.json(semanasDataURL)
    .then((data) => {
      data = data.map(d => ({
        Semana: +d["Semana "],
        Venta: +d["Venta"].replace(/,/g, ""),
        ProyeccionVenta: +d["Proyección venta"].replace(/,/g, "")
      }));

      function updateChart(selectedRange) {
        const [startWeek, endWeek] = selectedRange.split("-").map(Number);
        const filteredData = data.filter(d => d.Semana >= startWeek && d.Semana <= endWeek);

        svg.selectAll("*").remove();

        const x = d3
          .scaleBand()
          .domain(filteredData.map((d) => d.Semana))
          .range([0, width])
          .padding(0.3);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(filteredData, (d) => d.Venta)])
          .nice()
          .range([height, 0]);

        svg
          .append("g")
          .attr("class", "grid")
          .selectAll("line")
          .data(y.ticks())
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", (d) => y(d))
          .attr("y2", (d) => y(d))
          .attr("stroke", "#e0e0e0")
          .attr("stroke-width", 1);

        svg
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).tickSize(0))
          .selectAll("text")
          .style("text-anchor", "middle")
          .style("font-size", "14px");

        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + 60)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .text("Semana del año");

        svg
          .append("g")
          .call(d3.axisLeft(y).tickSize(0))
          .selectAll("text")
          .style("font-size", "14px");

        svg
          .append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -90)
          .style("font-size", "14px")
          .text("Venta en pesos chilenos");

        svg
          .selectAll("rect")
          .data(filteredData)
          .enter()
          .append("rect")
          .attr("x", (d) => x(d.Semana))
          .attr("y", (d) => y(d.Venta))
          .attr("width", x.bandwidth())
          .attr("height", (d) => height - y(d.Venta))
          .attr("fill", (d) => (d.Semana >= startWeek && d.Semana <= endWeek && d.Semana === currentWeek ? "#FFB900" : "#4E8CA2"))
          .attr("opacity", 0.9)
          .attr("rx", 8)
          .attr("ry", 8)
          .on("mouseover", (event, d) => {
            tooltip
              .style("visibility", "visible")
              .text(`Semana ${d.Semana}: ${d.Venta.toLocaleString()} pesos chilenos`);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("top", `${event.pageY - 20}px`)
              .style("left", `${event.pageX + 10}px`);
          })
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });
      }

      updateChart(getInitialWeekRange());

      d3.select("#semana-filter").on("change", function () {
        const selectedRange = this.value;
        updateChart(selectedRange);
      });
    })
    .catch((error) => console.error("Error al cargar los datos:", error));
});
