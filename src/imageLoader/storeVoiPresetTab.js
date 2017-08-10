function getStringsTab (dataSet, tag) {
  let tab;
  const stringValue = dataSet.string(tag);

  if (stringValue && stringValue.length > 0) {
    tab = stringValue.split('\\');
  }

  return tab;
}

export default function storeVoiPresetTab (dataSet) {
  if (dataSet.storedValues === undefined) {
    dataSet.storedValues = {};
  }

  // Window Center (0028,1050)
  const windowCenterTag = 'x00281050';
  const windowCenterTab = getStringsTab(dataSet, windowCenterTag) || [];

  // Window Width (0028,1051)
  const windowWidthTag = 'x00281051';
  const windowWidthTab = getStringsTab(dataSet, windowWidthTag) || [];

  // Window Center/Width Explanation (0028,1055)
  const windowCenterWidthExplanationTag = 'x00281055';
  const windowCenterWidthExplanationTab = getStringsTab(dataSet, windowCenterWidthExplanationTag) || [];

  // On ajoute les WC/WW trouvés dans le tableau
  const voiPresetTab = [];

  for (let i = 0; i < windowCenterTab.length; i++) {
    voiPresetTab.push({
      voiPresetIndex: voiPresetTab.length,
      wc: Number(windowCenterTab[i]),
      ww: Number(windowWidthTab[i]),
      explanation: windowCenterWidthExplanationTab[i]
    });
  }

  // VOI LUT Sequence (0028,3010)
  const voiLutSequenceTag = 'x00283010';
  let voiLutSequenceValue;

  if (dataSet.elements[voiLutSequenceTag]) {
    voiLutSequenceValue = dataSet.elements[voiLutSequenceTag].items;
  }

  if (Array.isArray(voiLutSequenceValue)) {
    for (let i = 0; i < voiLutSequenceValue.length; i++) {
      // LUT Explanation (0028,3003)
      const LutExplanationTag = 'x00283003';
      let lutExplanation;

      if (voiLutSequenceValue[i].dataSet.elements[LutExplanationTag] === undefined) {
        lutExplanation = i;
      } else {
        lutExplanation = voiLutSequenceValue[i].dataSet.string(voiLutSequenceValue[i].dataSet.elements[LutExplanationTag]);
      }

      voiPresetTab.push({
        voiPresetIndex: voiPresetTab.length,
        voiLUT: voiLutSequenceValue[i].dataSet,
        explanation: lutExplanation
      });
    }
  }

  dataSet.storedValues.voiPresetTab = voiPresetTab;
}
