var documentBody = document.querySelector("[data-document]");

documentBody.addEventListener("ia-writer-change", function () {
  const bibliography = getBibliography();
  var citationIdx = 1;
  var alreadyReferencedKeys = [];

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /@[a-z]+/g,
    (citationText) => {
      const renderedCitation = renderCitation(
        citationText,
        citationIdx,
        bibliography,
        // work-around to force pass-by-reference
        { value: alreadyReferencedKeys }
      );
      citationIdx++;

      return renderedCitation;
    }
  );

  documentBody.innerHTML = `${documentBody.innerHTML}${renderBibliography(
    bibliography
  )}`;

  documentBody.innerHTML = documentBody.innerHTML.replace(
    /[A-Z][A-Z]+/g,
    (acronym) => `<abbr>${acronym}</abbr>`
  );

  deleteBibliography();
});

function renderCitation(
  citationText,
  citationIdx,
  bibliography,
  alreadyReferencedKeys
) {
  const citationKey = citationText.substring(1);

  const matchingReference = bibliography.references.find(
    (reference) => reference.key == citationKey
  );

  if (matchingReference == null) {
    return `<span style="color: red">${citationText}</span>`;
  } else {
    const renderedReference = renderReference(
      matchingReference,
      alreadyReferencedKeys.value.includes(citationKey)
    );
    const output = `<sup>${citationIdx}</sup><span class="citation"><span class="citation-idx">${citationIdx}</span>${renderedReference}</span>`;

    alreadyReferencedKeys.value.push(citationKey);

    return output;
  }
}

function renderBibliography(bibliography) {
  var output = "<h2>Bibliography</h2>";

  output += "<ul>";
  for (const reference of bibliography.references) {
    output += `<li>${renderReference(reference)}</li>`;
  }
  output += "</ul>";

  return output;
}

function renderReference(reference, alreadyReferenced) {
  if (alreadyReferenced) {
    return `${renderAuthor(reference.authorNames)}.`;
  } else {
    return `${renderAuthor(reference.authorNames)}. <em>${
      reference.title
    }.</em> ${reference.date}.`;
  }
}

function renderAuthor(authorNames) {
  var output = "";

  const givenNames = authorNames.slice(0, authorNames.length - 1);
  for (const givenName of givenNames) {
    output += `${givenName[0]}. `;
  }

  const lastName = authorNames[authorNames.length - 1];
  output += lastName;

  return output;
}

function getBibliography() {
  const list = getBibliographyElement().getElementsByTagName("ul")[0];

  return {
    references: [...list.children]
      .map((reference) => {
        const fields = reference.textContent.split("|");

        return {
          key: fields[0].trim(),
          authorNames: fields[1].trim().split(" "),
          title: fields[2].trim(),
          date: fields[3].trim(),
        };
      })
      .sort((ref1, ref2) => {
        const lastName = (reference) =>
          reference.authorNames[reference.authorNames.length - 1];

        return lastName(ref1).localeCompare(lastName(ref2));
      }),
  };
}

function deleteBibliography() {
  getBibliographyElement().remove();
}

function getBibliographyElement() {
  return document.getElementById("bib");
}
