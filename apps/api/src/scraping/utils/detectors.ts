const TECH_MAP: Record<string, string[]> = {
  'React': ['react.js', 'reactjs', 'react '],
  'Next.js': ['next.js', 'nextjs'],
  'Vue.js': ['vue.js', 'vuejs'],
  'Nuxt.js': ['nuxt.js', 'nuxtjs', 'nuxt '],
  'Angular': ['angular'],
  'Svelte': ['svelte', 'sveltekit'],
  'Solid.js': ['solid.js', 'solidjs'],
  'Remix': ['remix.run', 'remix '],
  'Astro': ['astro.build', 'astro '],
  'Ember.js': ['ember.js', 'emberjs'],
  'Qwik': ['qwik'],
  'HTMX': ['htmx'],

  'TypeScript': ['typescript'],
  'JavaScript': ['javascript', ' js '],
  'HTML/CSS': ['html5', 'css3', 'sass', 'scss', 'tailwind'],

  'Node.js': ['node.js', 'nodejs'],
  'NestJS': ['nestjs', 'nest.js'],
  'Express': ['express.js', 'expressjs'],
  'Fastify': ['fastify'],
  'Hono': ['hono.js', 'hono framework'],

  'Laravel': ['laravel'],
  'PHP': ['php'],
  'Symfony': ['symfony'],
  'WordPress': ['wordpress', 'wp developer'],
  'Drupal': ['drupal'],

  'Python': ['python'],
  'Django': ['django'],
  'FastAPI': ['fastapi', 'fast api'],
  'Flask': ['flask'],
  'SQLAlchemy': ['sqlalchemy'],
  'Celery': ['celery'],

  'Ruby': ['ruby'],
  'Rails': ['ruby on rails', ' rails'],
  'Sinatra': ['sinatra'],

  'Java': [' java '],
  'Spring': ['spring boot', 'spring framework', 'spring mvc'],
  'Kotlin': ['kotlin'],
  'Scala': ['scala', 'akka', 'play framework'],
  'Groovy': ['groovy', 'grails'],
  'Micronaut': ['micronaut'],
  'Quarkus': ['quarkus'],

  '.NET': ['.net', 'asp.net', 'dotnet'],
  'C#': ['c# ', 'csharp'],
  'F#': ['f# ', 'fsharp'],
  'Blazor': ['blazor'],
  'MAUI': ['.net maui'],

  'Go': [' golang', 'go developer', 'go engineer', ' go '],
  'Rust': [' rust '],

  'Elixir': ['elixir', 'phoenix framework'],
  'Erlang': ['erlang'],

  'Haskell': ['haskell'],
  'Clojure': ['clojure', 'clojurescript'],
  'OCaml': ['ocaml'],

  'C': [' c developer', 'embedded c', ' c programming'],
  'C++': ['c++', 'cpp'],
  'Zig': [' zig '],
  'Crystal': ['crystal lang'],

  'React Native': ['react native'],
  'Flutter': ['flutter', 'dart'],
  'Swift': ['swift', 'swiftui', 'ios developer'],
  'Android': ['android developer', 'android engineer'],
  'Ionic': ['ionic framework'],
  'Expo': ['expo sdk'],

  'Spark': ['apache spark', 'pyspark', 'databricks'],
  'Kafka': ['apache kafka', 'kafka streams'],
  'Flink': ['apache flink'],
  'Airflow': ['apache airflow', ' airflow'],
  'dbt': [' dbt ', 'data build tool'],
  'Hadoop': ['hadoop', 'hdfs', 'hive'],
  'Snowflake': ['snowflake'],
  'Fivetran': ['fivetran'],
  'Airbyte': ['airbyte'],

  'TensorFlow': ['tensorflow'],
  'PyTorch': ['pytorch'],
  'Scikit-learn': ['scikit-learn', 'sklearn'],
  'Hugging Face': ['hugging face', 'huggingface', 'transformers'],
  'LangChain': ['langchain'],
  'LlamaIndex': ['llama index', 'llamaindex'],
  'MLflow': ['mlflow'],
  'Kubeflow': ['kubeflow'],
  'Ray': ['ray.io', 'ray distributed'],
  'OpenAI API': ['openai api', 'gpt-4', 'chatgpt api'],

  'Docker': ['docker'],
  'Kubernetes': ['kubernetes', ' k8s'],
  'Terraform': ['terraform'],
  'Ansible': ['ansible'],
  'Pulumi': ['pulumi'],
  'Helm': ['helm chart'],
  'AWS': [' aws ', 'amazon web services', 'ec2', 'lambda', 's3 '],
  'GCP': ['google cloud', ' gcp '],
  'Azure': ['microsoft azure', ' azure '],
  'Cloudflare': ['cloudflare workers', 'cloudflare pages'],
  'CI/CD': ['github actions', 'gitlab ci', 'jenkins', 'circleci'],
  'Linux': ['linux', 'ubuntu', 'debian'],
  'Nginx': ['nginx'],
  'Prometheus': ['prometheus', 'grafana'],
  'Datadog': ['datadog'],

  'PostgreSQL': ['postgresql', 'postgres'],
  'MySQL': ['mysql'],
  'SQLite': ['sqlite'],
  'MongoDB': ['mongodb', 'mongoose'],
  'Redis': ['redis'],
  'Cassandra': ['cassandra', 'scylladb'],
  'DynamoDB': ['dynamodb'],
  'Elasticsearch': ['elasticsearch', 'opensearch'],
  'ClickHouse': ['clickhouse'],
  'TimescaleDB': ['timescaledb'],
  'CockroachDB': ['cockroachdb'],
  'Neo4j': ['neo4j', 'graph database'],
  'Supabase': ['supabase'],
  'PlanetScale': ['planetscale'],
  'Firebase': ['firebase', 'firestore'],

  'GraphQL': ['graphql', 'apollo client', 'apollo server'],
  'gRPC': ['grpc'],
  'REST API': ['rest api', 'restful'],
  'WebSockets': ['websockets', 'socket.io'],

  'Security': ['penetration test', 'pentest', 'appsec', 'security engineer', 'sast', 'dast'],
  'QA': ['qa engineer', 'sdet', 'test automation', 'selenium', 'cypress', 'playwright'],

  'Solidity': ['solidity'],
  'Web3': ['web3', 'blockchain', 'smart contract', 'ethereum', 'defi', 'nft'],
  'Solana': ['solana', 'rust blockchain'],
  'Move': ['move lang', 'aptos', 'sui'],
};

export function detectStack(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const found = Object.entries(TECH_MAP)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([tech]) => tech);
  return found.length ? found.join(', ') : 'N/A';
}

const RELOCATION_KW = [
  'relocation', 'relocat', 'visa sponsorship', 'work permit', 'visa support',
  'sponsored', 'immigration', 'moving allowance', 'visa provided', 'work authorization',
];

const REMOTE_GLOBAL_KW = [
  'worldwide', 'anywhere', 'global remote', 'fully remote', 'latam',
  'south america', 'latin america', 'all countries', 'international',
  'remote worldwide', 'open to all', 'work from anywhere',
];

export function detectType(title: string, description: string, defaultRemote = false, country = ''): string {
  const text = `${title} ${description}`.toLowerCase();
  const isRelocation = RELOCATION_KW.some((kw) => text.includes(kw));
  const isRemote =
    defaultRemote ||
    REMOTE_GLOBAL_KW.some((kw) => text.includes(kw)) ||
    (country && text.includes(country.toLowerCase())) ||
    text.includes('remote');

  if (isRelocation && isRemote) return 'Remote / Relocation';
  if (isRelocation) return 'Relocation';
  return isRemote ? 'Remote' : 'Onsite';
}

const SALARY_PATTERNS = [
  /\$[\d,.]+[kK]?\s*[-–]\s*\$[\d,.]+[kK]?(?:\s*(?:USD|\/yr|\/year|\/mo))?/,
  /€[\d,.]+[kK]?\s*[-–]\s*€[\d,.]+[kK]?(?:\s*(?:EUR|\/yr|\/year))?/,
  /[\d,]+\s*[-–]\s*[\d,]+\s*(?:USD|EUR|usd|eur)/,
  /(?:USD|EUR)\s*[\d,]+(?:\s*[-–]\s*[\d,]+)?/,
  /\$[\d,.]+[kK]?(?:\s*(?:USD|\/yr|\/year))?/,
];

// Bare numbers picked up from free-text descriptions are only worth showing
// if they plausibly look like real pay (not a team size, a year, a version
// number, etc). 1,000 covers a monthly LATAM-remote wage; 2,000,000 rules
// out garbage matches with no sane upper bound.
const MIN_PLAUSIBLE_SALARY = 1_000;
const MAX_PLAUSIBLE_SALARY = 2_000_000;

function parseSalaryAmount(raw: string): number {
  const kMatch = /^([\d,.]+)\s*[kK]$/.exec(raw.trim());
  const numeric = (kMatch ? kMatch[1] : raw).replace(/,/g, '');
  const value = parseFloat(numeric);
  return kMatch ? value * 1000 : value;
}

function isPlausibleSalary(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_PLAUSIBLE_SALARY && value <= MAX_PLAUSIBLE_SALARY;
}

export function extractSalary(text: string): string {
  if (!text) return '';
  for (const pattern of SALARY_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;

    const amounts = (match[0].match(/[\d,.]+\s*[kK]?/g) ?? []).map(parseSalaryAmount);
    if (!amounts.length || !amounts.every(isPlausibleSalary)) continue;

    return match[0].trim();
  }
  return '';
}

// Builds a salary string from structured min/max fields (as returned by
// Jobicy/Himalayas/RemoteOK's own APIs), suppressing any value that isn't
// plausible rather than rendering a bare currency code with no real number.
export function formatSalaryRange(currency: string, min?: number | null, max?: number | null): string {
  const validMin = typeof min === 'number' && isPlausibleSalary(min) ? min : undefined;
  const validMax = typeof max === 'number' && isPlausibleSalary(max) ? max : undefined;

  if (validMin === undefined && validMax === undefined) return '';
  if (validMin !== undefined && validMax !== undefined && validMin !== validMax) {
    return `${currency} ${validMin.toLocaleString()}–${validMax.toLocaleString()}`;
  }
  return `${currency} ${(validMin ?? validMax)!.toLocaleString()}`;
}
