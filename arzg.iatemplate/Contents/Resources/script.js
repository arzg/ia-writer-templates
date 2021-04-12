var documentBody = document.querySelector("[data-document]");

documentBody.addEventListener("ia-writer-change", function () {
  const bibliography = getBibliography();
  var citationIdx = 1;

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /@[a-z]+/g,
    (citationText) => {
      const renderedCitation = renderCitation(
        citationText,
        citationIdx,
        bibliography
      );
      citationIdx++;

      return renderedCitation;
    }
  );

  deleteBibliography();
});

function renderCitation(citationText, citationIdx, bibliography) {
  const citationKey = citationText.substring(1);

  const matchingReference = bibliography.references.find(
    (reference) => reference.key == citationKey
  );

  if (matchingReference == null) {
    return `<span style="color: red">${citationText}</span>`;
  } else {
    return `<sup>${citationIdx}</sup><span class="citation">${citationIdx}: ${matchingReference.author}, <em>${matchingReference.title}</em></span>`;
  }
}

function findCitations() {
  return documentBody.textContent.match(/@[a-z]+/g);
}

function getBibliography() {
  const list = getBibliographyElement().getElementsByTagName("ul")[0];

  return {
    references: [...list.children].map((reference) => {
      const fields = reference.textContent.split("|");

      return {
        key: fields[0].trim(),
        author: fields[1].trim(),
        title: fields[2].trim(),
      };
    }),
  };
}

function deleteBibliography() {
  getBibliographyElement().remove();
}

function getBibliographyElement() {
  return document.getElementById("bib");
}
