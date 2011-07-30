var w = 960,
    h = 500,
    fill = d3.scale.category20(); //Costruisce una scala di 20 colori da assegnare ad altrettante
                                  //categorie, verranno poi usati per contraddistinguere i vari 
                                  //gruppi (cluster) di nodi.

var vis = d3.select("#chart") //Seleziona "#chart" dal documento (D3 usa CSS3 per la select).
  .append("svg:svg") //Aggiunge l'elemento "svg" alla selection precedente restituendo così
                     //una nuova selection con aggiunti gli elementi in append.
    .attr("width", w)   //Attributi altezza e larghezza che si applicano alle select
    .attr("height", h); //appena effettuate.

d3.json("miserables.json", function(json) { //*** inizio funzione json ***//
		                            //Attua una request HTTP GET sul file json all'url
		                            //indicato nel primo parametro.
		                            //La function(json) è la funzione di callback, utilizzata
		                            //poichè la request è asincrona e si rende quindi
		                            //necessario richiamare tale funzione una volta acquisiti
		                            //i dati.

  //creazione del layout		                            
  var force = d3.layout.force() //Costruisce un nuovo layout force directed con 
                                //le impostazioni di default che vengono poi modificate 
                                //dai campi sottostanti, all'inizio (prima che si
                                //faccia start) nodi e link sono array vuoti.
      .charge(-120) //Setta la carica dei nodi, un valore negativo indica repulsione.
      .distance(30) //Distanza obiettivo dei nodi fra loro collegati.
      .nodes(json.nodes) //Associa i nodi del layout allo specifico array che li contiene,
                         //in questo caso la parte relativa a "nodes" nel file json.
                         //Ogni nodo può avere i seguenti attributi:
                         //- index: l'indice numerico (zero-based) del nodo nell'array;
                         //- x, y : coordinate della posizione corrente del nodo nel layout;
                         //- px, py : coordinate della posizione precedente del nodo nel layout;
                         //- fixed: un booleano che indica se la posizione del nodo dev'essere fissa;
                         //non c'è bisogno che questi attributi siano settati prima di passare l'array
                         //di nodi al layout, se non sono settati ne vengono assegnati di default 
                         //quando viene chiamato start(). Comunque meglio assicurarsi che altri dati
                         //memorizzati sui nodi non vadano in conflitto con queste proprietà.
      .links(json.links) //Associa i collegamenti nel layout ad un array che li esprima
                         //in questo caso la parte relativa a "links" nel file json.
                         //Ogni link ha i seguenti attributi: source (p.to di partenza) e
                         //target (p.to di arrivo).
                         //Conviene che questi attributi siano specificati in forma numerica in modo
                         //che nodes e links possano essere importati da un file json o da altre 
                         //descrizioni statiche che non permettano "circular linking".
                         //Si possono personalizzare la forza (strength) e distanza (distance) dei link.
      .size([w, h]) //Imposta le dimensioni del layout per il grafo a w X h. Tali dimensioni influenzano 
      		    //due aspetti del layout: il centro gravitazionale [w/2 , y/2] e la posizione 
      		    //iniziale random dei nodi.
      .start(); //Fa partire la simulazione, questo metodo viene chiamato solo quando il layout è 
                //stato creato e sono stati assegnati nodi e link.

  //creazione dei nodi             
  var link = vis.selectAll("line.link") //Seleziona tutti i link
      .data(json.links) //Unisce i relativi dati (ossia quelli links del file json alle selction fatte in 
                        //precedenza).
    .enter().append("svg:line") //Associa l'elemento grafico linea ai link.
      .attr("class", "link") //Imposta l'attributo con il nome (specificati tra parentesi) su tutti
                             //gli elementi selezionati.
       // "d" indica sempre il dato corrente (in questo caso i link)
      .style("stroke-width", function(d) { return Math.sqrt(d.value); }) //Serve ad impostare le proprietà
      									 //di stile dal file CSS. La funzione
      									 //fa sì che lo spessore dei collegamenti
      									 //fra i nodi sia proporzionale al valore
      									 //del link (tanti pixel come la radice
      									 //quadrata di "value" del link).
      .attr("x1", function(d) { return d.source.x; }) //attributo ascissa del nodo di partenza
      .attr("y1", function(d) { return d.source.y; }) //attributo ordinata del nodo di partenza
      .attr("x2", function(d) { return d.target.x; }) //attributo ascissa del nodo di arrivo
      .attr("y2", function(d) { return d.target.y; });//attributo ordinata del nodo di arrivo 

  //creazione dei nodi
  var node = vis.selectAll("circle.node") //Seleziona tutti i nodi (aggiunge alle select già fatte)
      .data(json.nodes) //Unisce i relativi dati (ossia quelli nodes del file json alle selction fatte in 
                        //precedenza).
    .enter().append("svg:circle") //Associa l'elemento grafico "cerchio" ai nodi.
      .attr("class", "node") //Imposta l'attributo con il nome (specificati tra parentesi) su tutti
                             //gli elementi selezionati.
      .attr("cx", function(d) { return d.x; }) //attributo ascissa del nodo 
      .attr("cy", function(d) { return d.y; }) //attributo ordinata del nodo
      .attr("r", 5) //Imposta il raggio dei cerchi che rappresentano i nodi (come attributo).
      .style("fill", function(d) { return fill(d.group); }) //Utilizza i gruppi di colori creati dentro a 
      							    // "fill" all'inizio del file.
      .call(force.drag); //Chiama la funzione drag del layout force directed. La funzione drag permette
                         //di associare un comportamento ai nodi, ad esempio il cambio della posizione 
                         //quando si clicca con il mouse e/o si trascina un nodo.

  node.append("svg:title")                     //Associa un title ai nodi prendendone il testo 
      .text(function(d) { return d.name; });   //dall'attributo name dei nodi nel file json.

  vis.style("opacity", 1e-6)  //Applica le proprietà di stile CSS specificate nella parentesi
                              //agli elementi già selezionati.
    .transition()             //Fa partire la transition (modifica lo stile in modo smooth).
      .duration(1000)         //Specifica la durata in millisecondi della transition.
      .style("opacity", 1);   //Obiettivo finale della transition.
      			      //In pratica questo pezzo di codice fa sì che il grafo passi da
      			      //trasparente a completamente visibile in modo smooth nel tempo indicato
      			      //da duration().

      			      //*** inizio funzione per i tick ***//
  force.on("tick", function() {                         //Funzione listener che gestisce l'evento 
    link.attr("x1", function(d) { return d.source.x; }) //"tick" aggiornando in modo dinamico la
        .attr("y1", function(d) { return d.source.y; }) //posizione dei nodi.
        .attr("x2", function(d) { return d.target.x; }) 
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }); //*** fine funzione per i tick ***//
}); //*** fine funzione json ***//
