const transacciones = "https://raw.githubusercontent.com/reteuber/datos_capstone/refs/heads/main/transacciones.json";

const width = 800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 20, left: 50 };

const calcularPromedio = (data) => {
  const total = d3.sum(data, d => d.Cantidad);
  return (total / data.length).toFixed(2);
};

const svg = d3.select("#vis-1")
  .append("svg")
  .attr("width", width + margin.left + margin.right + 150)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

d3.json(transacciones).then(data => {
  const promedio = calcularPromedio(data);

  const x = d3.scaleBand()
    .domain(data.map(d => d.Hora))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Cantidad)])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("dx", "0")
    .attr("dy", "1em");

  svg.append("g")
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.Hora))
    .attr("y", d => y(d.Cantidad))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.Cantidad))
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", "#F6BA2C")
    .on("mouseover", (event, d) => {
      titleText.text(`Cantidad de transacciones a las ${d.Hora}`);
      infoText.text(`Cantidad: ${d.Cantidad}`);
      if (d.Cantidad > 100) {
        alertText.text("🚨 Alerta de horario peak");
      } else if (d.Cantidad >= 60 && d.Cantidad <= 100) {
        alertText.text("🥤 Horario Normal, todo controlado");
      } else {
        alertText.text("🌾 Horario Valle, hay poca demanda");
      }
    })
    .on("mouseout", () => {
      titleText.text("Cantidad de transacciones");
      infoText.text(`Promedio: ${promedio}`);
      if (promedio > 100) {
        alertText.text("🚨 Alerta de horario peak");
      } else if (promedio >= 60 && promedio <= 100) {
        alertText.text("🥤 Horario Normal, todo controlado");
      } else {
        alertText.text("🌾 Horario Valle, hay poca demanda");
      }
    });

  svg.append("rect")
    .attr("x", width + 75)
    .attr("y", 20)
    .attr("width", 450)
    .attr("height", 200)
    .attr("fill", "#DBE1FF")
    .attr("rx", 10)
    .attr("ry", 10);

  const titleText = svg.append("text")
    .attr("x", width + 90)
    .attr("y", 60)
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .style("fill", "#333")
    .text("Cantidad de transacciones");

  const infoText = svg.append("text")
    .attr("x", width + 90)
    .attr("y", 110)
    .style("font-size", "20px")
    .style("fill", "#333")
    .text(`Promedio: ${promedio}`);

  const alertText = svg.append("text")
    .attr("x", width + 90)
    .attr("y", 160)
    .style("font-size", "18px")
    .style("fill", "red")
    .text("");

  if (promedio > 100) {
    alertText.text("🚨 Alerta de horario peak");
  } else if (promedio >= 60 && promedio <= 100) {
    alertText.text("🥤 Horario Normal, todo controlado");
  } else {
    alertText.text("🌾 Horario Valle, hay poca demanda");
  }
}).catch(error => console.error("Error al cargar los datos:", error));
