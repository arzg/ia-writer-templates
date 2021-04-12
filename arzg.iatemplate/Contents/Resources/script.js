var documentBody = document.querySelector("[data-document]");

documentBody.addEventListener("ia-writer-change", function () {
  const bibliography = getBibliography();

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /@[a-z]+/g,
    (citationText) => renderCitation(citationText, bibliography)
  );

  deleteBibliography();
});

function renderCitation(citationText, bibliography) {
  const citationKey = citationText.substring(1);

  const matchingReference = bibliography.references.find(
    (reference) => reference.key == citationKey
  );

  if (matchingReference == null) {
    return `<span style="color: red">${citationText}</span>`;
  } else {
    return `(${matchingReference.author}, <em>${matchingReference.title}</em>)`;
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
