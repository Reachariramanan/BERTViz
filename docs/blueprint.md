# **App Name**: BERTviz Explorer

## Core Features:

- Input Text Field: Accept a sentence as input for analysis, submitted via a text field.
- Attention Heat Map Visualization: Display BERT weights visually as a heat map for each layer of the transformer model. The heatmaps dynamically update based on the input sentence.
- Neuron Selection: Allow users to select individual neurons within each layer.
- Neuron Attribute Tagging: Enable users to assign a descriptive name/purpose to each neuron. This name is stored temporarily (client-side only) for display on hover. Once the user closes the page or refreshes, the description should be discarded.
- Hover Display: On hovering over a neuron, display its assigned name/purpose.
- Weight Activation Lineage: Highlight and draw a line to connect the top k (e.g., top 3) most activated weights to the next predicted weights in the subsequent layer when a weight is clicked.
- Backend Weight Saving: Python backend using transformers to save BERT layer weight activations layer by layer to display on UI depending upon users input

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to reflect the analytical nature of the tool, avoiding cliches such as teal. The hue suggests insight.
- Background color: Light gray (#F0F2F5) for a clean and professional look.
- Accent color: Vivid purple (#9C27B0) to highlight interactive elements and data flows.
- Body font: 'Inter' (sans-serif) for clear readability of text labels and explanations.
- Headline font: 'Space Grotesk' (sans-serif) for titles and headings.
- Use simple, clear icons to represent different functions, such as selection, tagging, and navigation.
- Divide the UI into clear sections for input, heat map visualization, and neuron information.