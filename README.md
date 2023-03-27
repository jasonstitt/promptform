<p align="center"><img src="https://user-images.githubusercontent.com/13382947/227810702-33115918-c284-47b0-a232-3952447ef71b.png"></p>

# `promptform`

![license](https://img.shields.io/badge/license-MIT-green)

Promptform is an open-source command-line tool for running files in bulk through the OpenAI Completions API (e.g., with GPT-3.5).

## Disclaimer

PromptForm is not affiliated with OpenAI. Users are responsible for managing their own OpenAI account, API key, and related charges incurred during usage. Please refer to OpenAI's [Pricing](https://openai.com/pricing) for more information on costs associated with using the Completions API.

## Features

- Easily run entire directories of files through the OpenAI Completions API
- Include and exclude file glob patterns
- Replace content in-place or create new files alongside source files
- Designed for use with GPT-3.5 and compatible with future versions
- User-friendly command line interface

## Installation

```bash
$ npm install -g promptform
```

## Usage

Set up your OpenAI API key, either in a file, or as an environment variable.

```bash
echo 'your_api_key_here' > $HOME/.openai-token
# or
export OPENAI_API_KEY='your_api_key_here'
```

Discover options using the command-line help.

```bash
promptform --help
```

## Examples

Summarize all text files:

```bash
promptform --token-file ~/.openai-token --include '**/*.txt' --prompt 'Summarize this text:' --extension '.summary.txt'
```

Generate unit tests:

```bash
promptform --token-file ~/.openai-token --include '**/*.ts' --omit '**/*.test.ts' --prompt 'Output only code and do not explain. Write unit tests for this TypeScript module:' --extension '.test.ts'
```

## License

Promptform is licensed under the MIT License. See `LICENSE`.

## Maintainers

* Jason Stitt
