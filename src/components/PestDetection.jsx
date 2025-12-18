import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
} from 'react';
import { useLanguage } from '../context/LanguageContext';

/* =========================
   Pest Knowledge Mapping
   ========================= */
const pestInfoMap = {
  aphid: {
    diseaseName: 'Aphid Infestation',
    description:
      'Aphids are small sap-sucking insects that weaken plants by feeding on plant juices and can transmit plant diseases.',
    symptoms: [
      'Curled or distorted leaves',
      'Sticky residue (honeydew) on leaves',
      'Presence of ants around plants',
      'Stunted plant growth',
    ],
    organicTreatments: [
      'Spray neem oil solution regularly',
      'Introduce natural predators like ladybugs',
      'Wash plants with a strong stream of water',
    ],
    chemicalTreatments: [
      'Apply imidacloprid-based insecticides',
      'Use pyrethroid sprays if infestation is severe',
    ],
  },

  fruitfly: {
    diseaseName: 'Fruit Fly Infestation',
    description:
      'Fruit flies lay eggs inside fruits, causing internal damage and making fruits unfit for consumption.',
    symptoms: [
      'Small puncture marks on fruits',
      'Premature fruit drop',
      'Soft or rotten patches inside fruit',
      'Maggots found inside affected fruits',
    ],
    organicTreatments: [
      'Use pheromone or bait traps',
      'Collect and destroy infected fruits',
      'Maintain orchard sanitation',
    ],
    chemicalTreatments: [
      'Apply spinosad-based bait sprays',
      'Use recommended insecticide sprays during early infestation',
    ],
  },

  scale: {
    diseaseName: 'Scale Insect Infestation',
    description:
      'Scale insects attach themselves to plant stems and leaves, sucking sap and weakening the plant over time.',
    symptoms: [
      'Small brown or white bumps on stems and leaves',
      'Yellowing or wilting of leaves',
      'Sticky honeydew secretion',
      'Reduced plant vigor',
    ],
    organicTreatments: [
      'Prune heavily infested branches',
      'Apply neem oil or horticultural oil',
      'Clean affected areas with mild soap solution',
    ],
    chemicalTreatments: [
      'Apply systemic insecticides like imidacloprid',
      'Use oil-based sprays to suffocate insects',
    ],
  },
};

/* =========================
   Icons & UI Helpers
   ========================= */
const UploadIcon = () => (
  <svg
    className="w-12 h-12 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
    />
  </svg>
);

const LoadingSpinner = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className="animate-spin h-12 w-12 text-green-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
        {t('analyzingPlant')}
      </p>
    </div>
  );
};

/* =========================
   Upload Section
   ========================= */
const UploadSection = React.forwardRef(({ onImageUpload, t }, ref) => {
  const [imagePreview, setImagePreview] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      onImageUpload(file);
    };
    reader.readAsDataURL(file);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      setImagePreview(null);
      if (inputRef.current) inputRef.current.value = '';
    },
  }));

  return (
    <div className="w-72 h-72 mx-auto">
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-300"
      >
        {!imagePreview ? (
          <>
            <UploadIcon />
            <p className="mt-3 text-base font-semibold text-gray-700 dark:text-gray-300">
              {t('uploadImage')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              PNG, JPG, WEBP
            </p>
          </>
        ) : (
          <img
            src={imagePreview}
            alt="Preview"
            className="h-full w-full object-cover rounded-xl"
          />
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
});

/* =========================
   Results Section
   ========================= */
const ResultsSection = ({ data, onReset, t }) => (
  <div className="space-y-8 animate-fadeIn">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {data.diseaseName}
      </h2>
      <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium mt-3 px-5 py-1.5 rounded-full">
        {t('confidence')}: {data.confidence}%
      </span>
    </div>

    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {t('description')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {data.description}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {t('commonSymptoms')}
        </h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
          {data.symptoms.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {t('recommendedTreatments')}
        </h3>

        <h4 className="mt-3 font-semibold text-gray-600 dark:text-gray-400">
          {t('organicSolutions')}:
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
          {data.organicTreatments.map((treat, i) => (
            <li key={i}>{treat}</li>
          ))}
        </ul>

        <h4 className="mt-4 font-semibold text-gray-600 dark:text-gray-400">
          {t('chemicalSolutions')}:
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-2 space-y-1">
          {data.chemicalTreatments.map((treat, i) => (
            <li key={i}>{treat}</li>
          ))}
        </ul>
      </div>
    </div>

    <button
      onClick={onReset}
      className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300"
    >
      {t('analyzeAnotherPlant')}
    </button>
  </div>
);

/* =========================
   Main Component
   ========================= */
export default function PestDetection() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('upload');
  const [resultsData, setResultsData] = useState(null);
  const uploadRef = useRef();

  const handleImageUpload = useCallback(async (file) => {
    setStatus('loading');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/pest/detect', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success || !data.result || data.result.length === 0) {
        throw new Error('No pests detected');
      }

      const pestResult = data.result.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      );

      const pestKey = pestResult.pest.toLowerCase();
      const pestInfo = pestInfoMap[pestKey];

      if (!pestInfo) throw new Error('Unsupported pest');

      setResultsData({
        diseaseName: pestInfo.diseaseName,
        confidence: Math.round((pestResult.avg_confidence || 0.7) * 100),
        description: pestInfo.description,
        symptoms: pestInfo.symptoms,
        organicTreatments: pestInfo.organicTreatments,
        chemicalTreatments: pestInfo.chemicalTreatments,
      });

      setStatus('results');
    } catch (err) {
      console.error(err);
      alert('Failed to analyze image. Please try again.');
      setStatus('upload');
    }
  }, []);

  const handleReset = useCallback(() => {
    uploadRef.current?.reset();
    setResultsData(null);
    setStatus('upload');
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
        {t('pestDetection')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {t('pestDetectionDescription')}
      </p>

      {status === 'upload' && (
        <UploadSection ref={uploadRef} onImageUpload={handleImageUpload} t={t} />
      )}
      {status === 'loading' && (
        <div className="p-8">
          <LoadingSpinner />
        </div>
      )}
      {status === 'results' && (
        <ResultsSection data={resultsData} onReset={handleReset} t={t} />
      )}
    </div>
  );
}
